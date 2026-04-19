import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import { google } from "googleapis";
import dotenv from "dotenv";
import { Readable } from "stream";
import { Storage } from "megajs";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3001);

  app.use(cors());
  app.use(express.json());

  // Multer setup for memory storage
  const upload = multer({ storage: multer.memoryStorage() });

  // Google Auth Setup
  const getGoogleAuth = () => {
    const jsonKey = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!jsonKey) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is missing");
    }
    try {
      const credentials = JSON.parse(jsonKey);
      return new google.auth.GoogleAuth({
        credentials,
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive",
        ],
      });
    } catch (e) {
      throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON format. Ensure it is a valid JSON string.");
    }
  };

  // API Route: Save Lead to Google Sheets
  app.post("/api/leads", async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      
      let auth;
      try {
        auth = getGoogleAuth();
      } catch (authError: any) {
        return res.status(400).json({
          success: false,
          error: "Google Authentication Configuration Error",
          technicalDetails: authError.message
        });
      }

      const sheets = google.sheets({ version: "v4", auth });
      
      let spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim();
      if (!spreadsheetId) {
        return res.status(400).json({
          success: false,
          error: "Spreadsheet ID is missing",
          technicalDetails: "GOOGLE_SHEET_ID environment variable is not set."
        });
      }

      // Robust extraction of ID from URL or raw ID
      if (spreadsheetId.includes("docs.google.com")) {
        const parts = spreadsheetId.split("/");
        const dIndex = parts.indexOf("d");
        if (dIndex !== -1 && parts[dIndex + 1]) {
          spreadsheetId = parts[dIndex + 1];
        }
      }

      console.log(`Verifying access to spreadsheet: ${spreadsheetId}`);
      try {
        const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
        console.log(`Spreadsheet title: ${sheetMetadata.data.properties?.title}`);
      } catch (metaError: any) {
        console.error("Spreadsheet Access Error:", metaError.message);
        throw new Error(`Cannot access spreadsheet. Ensure it is shared with the Service Account email as 'Editor'. Details: ${metaError.message}`);
      }

      console.log(`Attempting to append to spreadsheet: ${spreadsheetId}`);
      console.log(`Data to append:`, [new Date().toISOString(), name, email, phone]);

      // Try to append. We use 'A1' as a generic range to target the first sheet.
      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "A1", 
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [[new Date().toISOString(), name, email, phone]],
        },
      });

      console.log('Sheets API Response:', JSON.stringify(appendResponse.data, null, 2));
      console.log('Append successful. Updated range:', appendResponse.data.updates?.updatedRange);

      res.json({ 
        success: true, 
        message: "Lead saved to Google Sheets",
        updatedRange: appendResponse.data.updates?.updatedRange 
      });
    } catch (error: any) {
      const status = error.response?.status;
      const errorData = error.response?.data?.error;
      const errorMessage = errorData?.message || error.message;
      
      console.error("Google Sheets API Error:", {
        status,
        message: errorMessage,
        code: errorData?.code
      });

      let userMessage = "Failed to save lead details.";
      if (status === 404) {
        userMessage = "Spreadsheet not found. Please check your GOOGLE_SHEET_ID.";
      } else if (status === 403) {
        userMessage = "Permission denied. Please share the sheet with your Service Account email as an 'Editor'.";
      } else if (errorMessage.includes("invalid_grant")) {
        userMessage = "Google Authentication failed. Please check your Service Account JSON.";
      }

      res.status(status || 500).json({ 
        success: false, 
        error: userMessage,
        technicalDetails: errorMessage
      });
    }
  });

  // API Route: Upload File (Supports MEGA and Google Drive)
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    let serviceAccountEmail = "your service account email";
    try {
      if (!req.file) throw new Error("No file uploaded");

      // Check for MEGA credentials first
      const megaEmail = process.env.MEGA_EMAIL;
      const megaPassword = process.env.MEGA_PASSWORD;

      if (megaEmail && megaPassword) {
        console.log("Attempting upload to MEGA...");
        try {
          const storage = await new Storage({
            email: megaEmail,
            password: megaPassword
          }).ready;

          // Organize into a "Scans" folder
          let targetFolder = storage.root.children?.find(child => child.name === "Scans" && child.directory);
          if (!targetFolder) {
            console.log("Creating 'Scans' folder in MEGA...");
            targetFolder = await storage.mkdir("Scans");
          }

          const uniqueFilename = `${uuidv4()}_${req.file.originalname}`;
          console.log(`Uploading to MEGA as: ${uniqueFilename}`);

          const file = await targetFolder.upload({
            name: uniqueFilename,
            size: req.file.size
          }, req.file.buffer).complete;

          const link = await file.link({});
          console.log("MEGA upload successful:", link);
          
          return res.json({ 
            success: true, 
            fileId: file.name, 
            link: link,
            provider: "MEGA"
          });
        } catch (megaError: any) {
          console.error("MEGA Upload Error Details:", megaError);
          
          let megaUserMessage = "MEGA Upload Failed";
          if (megaError.message?.includes("Login failed")) {
            megaUserMessage = "MEGA Login failed. Please check your MEGA_EMAIL and MEGA_PASSWORD in Secrets.";
          } else if (megaError.message?.includes("API limit")) {
            megaUserMessage = "MEGA API limit exceeded. Please try again later or upgrade your MEGA account.";
          }
          
          throw new Error(`${megaUserMessage} (${megaError.message})`);
        }
      }

      // Fallback to Google Drive if MEGA is not configured
      console.log("MEGA not configured, falling back to Google Drive...");
      let auth;
      try {
        auth = getGoogleAuth();
      } catch (authError: any) {
        return res.status(400).json({
          success: false,
          error: "Google Authentication Configuration Error",
          technicalDetails: authError.message
        });
      }

      const drive = google.drive({ version: "v3", auth });
      
      serviceAccountEmail = (auth as any).credentials?.client_email || serviceAccountEmail;
      
      let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
      if (!folderId) {
        return res.status(400).json({
          success: false,
          error: "Drive Folder ID is missing",
          technicalDetails: "Please set GOOGLE_DRIVE_FOLDER_ID in Secrets and share the folder with your Service Account email."
        });
      }

      // Extract ID from URL if necessary
      if (folderId.includes("drive.google.com")) {
        const parts = folderId.split("/");
        // Folder URLs usually look like .../folders/ID or .../folders/ID?usp=sharing
        const foldersIndex = parts.indexOf("folders");
        if (foldersIndex !== -1 && parts[foldersIndex + 1]) {
          folderId = parts[foldersIndex + 1].split("?")[0];
        }
      }
      
      console.log(`Final Folder ID being used: ${folderId}`);
      
      const fileMetadata = {
        name: `${Date.now()}_${req.file.originalname}`,
        parents: [folderId],
      };

      const media = {
        mimeType: req.file.mimetype,
        body: Readable.from(req.file.buffer),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink, name",
        supportsAllDrives: true,
        supportsTeamDrives: true, // Support for older Shared Drive configurations
      } as any);

      console.log('Drive upload successful:', {
        id: response.data.id,
        name: response.data.name,
        link: response.data.webViewLink
      });

      res.json({ 
        success: true, 
        fileId: response.data.id, 
        link: response.data.webViewLink,
        provider: "Google Drive"
      });
    } catch (error: any) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = (typeof errorData === 'object' && errorData?.error?.message) || error.message;

      console.error("Upload API Error Details:", {
        status,
        message: errorMessage,
        data: typeof errorData === 'string' ? 'HTML Response' : errorData
      });

      let userMessage = "Failed to upload scan.";
      if (status === 404) {
        userMessage = "Drive Folder not found. Please check your GOOGLE_DRIVE_FOLDER_ID.";
      } else if (status === 403 || status === 401) {
        if (errorMessage.includes("storage quota")) {
          userMessage = "Storage quota exceeded. Please use a folder owned by a regular Google account or switch to MEGA.";
        } else if (errorMessage.includes("Drive API has not been used") || errorMessage.includes("API has not been used")) {
          userMessage = "Google Drive API is not enabled. Please enable it in your Google Cloud Console.";
        } else {
          userMessage = `Permission denied. Ensure the folder is shared with ${serviceAccountEmail} as 'Editor'.`;
        }
      }

      // Use 400 instead of 403/500 to ensure JSON is returned and not intercepted by environment error pages
      res.status(400).json({ 
        success: false, 
        error: userMessage,
        technicalDetails: errorMessage
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
