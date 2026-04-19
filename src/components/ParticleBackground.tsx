import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ParticleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvas2DRef.current) return;

    /* ── Renderer ──────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.pointerEvents = 'none';
    containerRef.current.appendChild(renderer.domElement);

    const particleCanvas = canvas2DRef.current;
    const pctx = particleCanvas.getContext('2d');
    if (!pctx) return;

    const rect = containerRef.current.getBoundingClientRect();
    let W = rect.width, H = rect.height;
    renderer.setSize(W, H);

    function resizeParticleCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      particleCanvas.width = Math.floor(W * dpr);
      particleCanvas.height = Math.floor(H * dpr);
      particleCanvas.style.width = `${W}px`;
      particleCanvas.style.height = `${H}px`;
      pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeParticleCanvas();

    const PARTICLE_DISTANCE_D = 40.32;
    const CHAOS_FACTOR = 0.3;
    const RANDOMIZED_PARTICLE_RATIO = 0.5;
    const CAPSULE_LENGTH = 6;
    const CAPSULE_RADIUS = 1.0;
    const CAPSULE_ALPHA = 1.0;
    const capsules: any[] = [];

    function rebuildCapsules(d = PARTICLE_DISTANCE_D) {
      capsules.length = 0;

      const cols = Math.max(1, Math.floor(W / d));
      const rows = Math.max(1, Math.floor(H / d));
      const stepX = W / cols;
      const stepY = H / rows;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const useJitter = Math.random() < RANDOMIZED_PARTICLE_RATIO;
          const jitterX = useJitter ? (Math.random() - 0.5) * stepX * CHAOS_FACTOR * 2 : 0;
          const jitterY = useJitter ? (Math.random() - 0.5) * stepY * CHAOS_FACTOR * 2 : 0;
          const x = Math.min(W - CAPSULE_LENGTH, Math.max(CAPSULE_LENGTH, (col + 0.5) * stepX + jitterX));
          const y = Math.min(H - CAPSULE_LENGTH, Math.max(CAPSULE_LENGTH, (row + 0.5) * stepY + jitterY));

          capsules.push({
            x,
            y,
            vx: 0,
            vy: 0,
            length: CAPSULE_LENGTH,
            radius: CAPSULE_RADIUS,
            alpha: CAPSULE_ALPHA,
          });
        }
      }
    }

    rebuildCapsules();

    /* ── Camera ────────────────────────────────────────────── */
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0, 7);

    /* ── Scene ─────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.background = null;

    /* ── Lighting — soft studio setup ──────────────────────── */
    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(5, 8, 6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x8eb8ff, 0.8);
    fill.position.set(-4, -2, 4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffd4a8, 0.6);
    rim.position.set(0, -5, -4);
    scene.add(rim);

    /* ── Environment map (fake, for reflections) ──────────── */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new THREE.Scene(), 0.04);
    scene.environment = envRT.texture;

    const R = 1.964;     // major radius
    const a = 1.189;     // horizontal semi-axis
    const b = 0.35;      // vertical semi-axis (z-direction)
    const SEG_R = 48;    // toroidal segments (θ)
    const SEG_T = 24;    // poloidal segments (φ)

    const geo = new THREE.TorusGeometry(R, a, SEG_T, SEG_R);
    const posAttr = geo.getAttribute('position');
    const vertCount = posAttr.count;

    const restX = new Float32Array(vertCount);
    const restY = new Float32Array(vertCount);
    const restZ = new Float32Array(vertCount);
    const curX = new Float32Array(vertCount);
    const curY = new Float32Array(vertCount);
    const curZ = new Float32Array(vertCount);

    for (let j = 0; j <= SEG_R; j++) {
      const theta = (j / SEG_R) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      for (let k = 0; k <= SEG_T; k++) {
        const phi = (k / SEG_T) * Math.PI * 2;
        const idx = j * (SEG_T + 1) + k;
        if (idx >= vertCount) continue;

        restX[idx] = (R + a * Math.cos(phi)) * cosT;
        restY[idx] = (R + a * Math.cos(phi)) * sinT;
        restZ[idx] = b * Math.sin(phi);

        curX[idx] = restX[idx];
        curY[idx] = restY[idx];
        curZ[idx] = restZ[idx];
        posAttr.setXYZ(idx, restX[idx], restY[idx], restZ[idx]);
      }
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x4a7dff),
      metalness: 0.0,
      roughness: 1.0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const raycaster = new THREE.Raycaster();
    const sampleNDC = new THREE.Vector2();

    function getAngleWaveField(baseTheta: number, basePhi: number, t: number) {
      const w1 = 0.2 * Math.sin(t * 2 + baseTheta * 1.5);
      const w2 = 0.15 * Math.sin(t * 1.5 + basePhi * 1.2);
      return { thetaDelta: w1 * 0.4, phiDelta: w2 * 0.4 };
    }

    function sampleFrontTorus(screenX: number, screenY: number, time: number, mouse3Dx: number, mouse3Dy: number) {
      sampleNDC.x = (screenX / W) * 2 - 1;
      sampleNDC.y = -(screenY / H) * 2 + 1;
      raycaster.setFromCamera(sampleNDC, camera);

      const hits = raycaster.intersectObject(mesh, false);
      if (!hits.length) return null;

      const hit = hits[0];
      if (hit.point.z <= 0) return null;

      const relX = hit.point.x - mouse3Dx;
      const relY = hit.point.y - mouse3Dy;
      const relZ = hit.point.z;

      const theta = Math.atan2(relY, relX);
      const rho = Math.sqrt(relX * relX + relY * relY);
      const u = (rho - R) / a;
      const v = relZ / b;
      const phi = Math.atan2(v, u);

      const angleWave = getAngleWaveField(theta, phi, time);
      const thetaWave = theta + angleWave.thetaDelta;
      const phiWave = phi + angleWave.phiDelta;

      return { theta: thetaWave, phi: phiWave, u, v };
    }

    /* ── Mouse tracking ────────────────────────────────────── */
    let mouseNDCx = 0, mouseNDCy = 0;
    let mouse3Dx = 0, mouse3Dy = 0;
    let mousePxX = W * 0.5, mousePxY = H * 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (W > 0 && H > 0) {
        mouseNDCx = (x / W) * 2 - 1;
        mouseNDCy = -(y / H) * 2 + 1;
        mousePxX = x;
        mousePxY = y;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      if (W > 0 && H > 0) {
        mouseNDCx = (x / W) * 2 - 1;
        mouseNDCy = -(y / H) * 2 + 1;
        mousePxX = x;
        mousePxY = y;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      W = rect.width; H = rect.height;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      resizeParticleCanvas();
      rebuildCapsules();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    function drawCapsules(t: number, mouse3Dx: number, mouse3Dy: number) {
      if (W <= 0 || H <= 0) return;
      pctx.clearRect(0, 0, W, H);

      for (let i = 0; i < capsules.length; i++) {
        const c = capsules[i];

        const dx = c.x - mousePxX;
        const dy = c.y - mousePxY;
        const distToCursor = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.sqrt(W * W + H * H) * 0.5;
        const normalizedDist = Math.min(distToCursor / maxDist, 1);
        
        const nearSpeed = 0.06;
        const farSpeed = 0.008;
        const followSpeed = farSpeed + (nearSpeed - farSpeed) * (1 - normalizedDist);
        
        if (distToCursor > 0.5) {
          const dirX = -dx / distToCursor;
          const dirY = -dy / distToCursor;
          c.vx = dirX * followSpeed;
          c.vy = dirY * followSpeed;
        } else {
          c.vx = 0;
          c.vy = 0;
        }

        c.x += c.vx;
        c.y += c.vy;

        if (c.x < -16) c.x = W + 16;
        else if (c.x > W + 16) c.x = -16;
        if (c.y < -16) c.y = H + 16;
        else if (c.y > H + 16) c.y = -16;

        const torusSample = sampleFrontTorus(c.x, c.y, t, mouse3Dx, mouse3Dy);
        if (!torusSample) continue;

        const thetaSqueeze = Math.sin(torusSample.theta * 3) * 0.7;
        const phiSqueeze = Math.sin(torusSample.phi * 4) * 0.7;
        const spatialSqueeze = thetaSqueeze * phiSqueeze;
        const timeVariation = Math.sin(t * 0.8) * 0.15;
        
        const aDynamic_p = 0.14 * Math.sin(t * 2.1) +
                          0.11 * Math.sin(torusSample.theta * 3 + t * 1.5) +
                          0.07 * Math.sin(torusSample.phi * 4 + t * 2.3) +
                          0.08 * Math.sin(t * 3.8 - torusSample.theta * 3 + torusSample.phi * 2);
        
        const bDynamic_p = 0.1 * Math.sin(t * 1.8) +
                          0.08 * Math.sin(torusSample.phi * 4 + t * 2.2) +
                          0.06 * Math.sin(torusSample.theta * 3 + t * 1.9) +
                          0.07 * Math.sin(t * 3.2 + torusSample.phi * 2 - torusSample.theta * 3);
        
        const compressionBase = spatialSqueeze + timeVariation + aDynamic_p * 0.8 + bDynamic_p * 0.4;
        const compression = 1 + compressionBase * 1.0;
        
        const compressionWave = thetaSqueeze * phiSqueeze;
        const offsetScale = compressionWave * 18;
        
        const w1_p = Math.sin(torusSample.theta * 3 + t * 2.8) * 0.08;
        const w2_p = Math.sin(torusSample.phi * 4 + t * 3.5) * 0.06;
        const w3_p = Math.sin(torusSample.theta * 3) * Math.sin(torusSample.phi * 4) * Math.sin(t * 1.5) * 0.05;
        const w4_p = Math.sin(torusSample.theta * 3 + t * 4.2) * 0.02;
        const w5_p = Math.sin(torusSample.phi * 4 + t * 2.1) * 0.015;
        const breath_p = Math.sin(t * 0.8) * 0.078;
        
        const radialSquish_p = w1_p + w3_p + w5_p + breath_p + aDynamic_p * 0.8 + bDynamic_p * 0.4;
        
        const cosTheta = Math.cos(torusSample.theta);
        const sinTheta = Math.sin(torusSample.theta);
        
        const dxCenter = c.x - W * 0.5;
        const dyCenter = c.y - H * 0.5;
        const distFromCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        const radialDir = distFromCenter > 0.1 ? [dxCenter / distFromCenter, dyCenter / distFromCenter] : [1, 0];
        
        const radialBreathing = -(compression - 1) * 30;
        const radialX = radialDir[0] * radialBreathing;
        const radialY = radialDir[1] * radialBreathing;
        
        const tangentX = cosTheta * radialSquish_p * 22.5;
        const tangentY = sinTheta * radialSquish_p * 22.5;
        
        const compressionOffsetX = Math.cos(torusSample.theta) * offsetScale * (compression - 1) * 4.5;
        const compressionOffsetY = Math.sin(torusSample.theta) * offsetScale * (compression - 1) * 4.5;
        
        const adjX = c.x + compressionOffsetX + tangentX + radialX;
        const adjY = c.y + compressionOffsetY + tangentY + radialY;

        const faceAngle = Math.atan2(mousePxY - adjY, mousePxX - adjX);
        const phiBoundary = Math.abs(Math.cos(torusSample.phi));
        const thetaMotion = 0.5 + 0.5 * Math.sin(t * 2.0 + torusSample.theta * 2.0);
        
        const waveLayer1 = 0.4 * Math.sin(t * 2.5 + torusSample.theta * 3);
        const waveLayer2 = 0.35 * Math.sin(t * 2.2 + torusSample.phi * 4);
        const waveLayer3 = 0.3 * Math.sin(t * 1.8 - torusSample.theta * 3 + torusSample.phi * 4);
        const waveOscillation = waveLayer1 + waveLayer2 + waveLayer3;
        
        const boundaryT = Math.min(1, phiBoundary * (0.85 + 0.15 * thetaMotion) + 0.18 * waveOscillation);
        const smoothBoundaryT = boundaryT * boundaryT * (3 - 2 * boundaryT);
        
        const sizeScale = 1 / compression;
        const drawLength = c.length * sizeScale * (1 - smoothBoundaryT) + (c.radius * 2.02) * smoothBoundaryT;
        const halfLen = drawLength * 0.5;
        const r = c.radius * sizeScale;

        const phiNorm = (torusSample.phi + Math.PI) / (2 * Math.PI);
        const baseIntensity = 40 + phiNorm * 40;
        
        const angleIntensity = 20 * Math.sin(torusSample.theta * 2 + t * 2.0) + 
                              15 * Math.cos(torusSample.phi * 1.5 + t * 1.5);
        
        const intensity = Math.max(20, Math.min(255, baseIntensity + angleIntensity * 1.5));
        const greyValue = Math.round(intensity);
        
        // ── Dynamic Blue Wave Clusters ──────────────────────────
        // Primary wave moving around the toroidal angle
        const wavePos = (t * 0.6) % (Math.PI * 2);
        let dTheta = Math.abs(torusSample.theta - wavePos);
        if (dTheta > Math.PI) dTheta = Math.PI * 2 - dTheta;
        
        // Spatial cluster mask (using theta and phi frequencies)
        const clusterMask = Math.sin(torusSample.theta * 8 + t * 0.5) * Math.cos(torusSample.phi * 5 - t * 0.3);
        const activeMask = Math.max(0, clusterMask - 0.2) * 1.5;
        
        // Combine wave position with cluster mask
        let blueFactor = Math.max(0, 1 - dTheta / 1.2) * activeMask;
        
        // Secondary "random" emergence points
        const emergence = Math.max(0, Math.sin(t * 0.8 + torusSample.theta * 4) * Math.sin(t * 0.6 - torusSample.phi * 3) - 0.75) * 4;
        blueFactor = Math.max(blueFactor, emergence);
        blueFactor = Math.min(1, blueFactor);

        // Interpolate between base grey and vibrant blue (#0071E3)
        const blueR = 0, blueG = 113, blueB = 227;
        const finalR = Math.round(greyValue + (blueR - greyValue) * blueFactor);
        const finalG = Math.round(greyValue + (blueG - greyValue) * blueFactor);
        const finalB = Math.round(greyValue + (blueB - greyValue) * blueFactor);
        
        const finalColor = `rgb(${finalR}, ${finalG}, ${finalB})`;

        pctx.save();
        pctx.translate(adjX, adjY);
        pctx.rotate(faceAngle);
        pctx.globalAlpha = c.alpha;
        pctx.globalCompositeOperation = 'lighter';
        pctx.fillStyle = finalColor;

        pctx.beginPath();
        pctx.moveTo(-halfLen + r, -r);
        pctx.lineTo(halfLen - r, -r);
        pctx.arc(halfLen - r, 0, r, -Math.PI / 2, Math.PI / 2);
        pctx.lineTo(-halfLen + r, r);
        pctx.arc(-halfLen + r, 0, r, Math.PI / 2, -Math.PI / 2);
        pctx.closePath();
        pctx.fill();

        pctx.restore();
      }
    }

    /* ── Animation loop ────────────────────────────────────── */
    let time = 0;
    const clock = new THREE.Clock();
    let frameCount = 0;
    let requestRef: number;

    function animate() {
      requestRef = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const dt60 = Math.min(delta * 60, 3);
      time += delta;
      frameCount += 1;

      const vFov = camera.fov * Math.PI / 180;
      const visH = 2 * Math.tan(vFov / 2) * camera.position.z;
      const visW = visH * camera.aspect;

      const targetCX = mouseNDCx * visW * 0.5;
      const targetCY = mouseNDCy * visH * 0.5;

      const centerAlpha = 1 - Math.pow(1 - 0.5, dt60);
      mouse3Dx += (targetCX - mouse3Dx) * centerAlpha;
      mouse3Dy += (targetCY - mouse3Dy) * centerAlpha;

      for (let j = 0; j <= SEG_R; j++) {
        const theta = (j / SEG_R) * Math.PI * 2;

        for (let k = 0; k <= SEG_T; k++) {
          const phi = (k / SEG_T) * Math.PI * 2;
          const i = j * (SEG_T + 1) + k;
          if (i >= vertCount) continue;

          const w1 = Math.sin(theta * 3 + time * 2.8) * 0.08;
          const w2 = Math.sin(phi * 4 + time * 3.5) * 0.06;
          const w3 = Math.sin(theta * 3) * Math.sin(phi * 4) * Math.sin(time * 1.5) * 0.05;
          const w4 = Math.sin(theta * 3 + time * 4.2) * 0.02;
          const w5 = Math.sin(phi * 4 + time * 2.1) * 0.015;
          const breath = Math.sin(time * 0.8) * 0.078;
          
          const pulseRadii = 1 + 0.5 * Math.sin(time * 2.5) + 0.3 * Math.sin(time * 1.7 + 0.5) + 0.2 * Math.sin(time * 3.8 - 1.2);
          
          const aDynamic = 0.14 * Math.sin(time * 2.1) +
                          0.11 * Math.sin(theta * 3 + time * 1.5) +
                          0.07 * Math.sin(phi * 4 + time * 2.3) +
                          0.08 * Math.sin(time * 3.8 - theta * 3 + phi * 2);
          
          const bDynamic = 0.1 * Math.sin(time * 1.8) +
                          0.08 * Math.sin(phi * 4 + time * 2.2) +
                          0.06 * Math.sin(theta * 3 + time * 1.9) +
                          0.07 * Math.sin(time * 3.2 + phi * 2 - theta * 3);
          
          const radialSquish = w1 + w3 + w5 + breath + aDynamic * 0.8 + bDynamic * 0.3;
          const zSquish = w2 + w4 + breath * 0.5 + bDynamic * 0.4;

          const maxRadialDeform = 0.6;
          const maxZDeform = 0.45;
          const clampedRadial = Math.max(-maxRadialDeform, Math.min(maxRadialDeform, radialSquish));
          const clampedZ = Math.max(-maxZDeform, Math.min(maxZDeform, zSquish));
          
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);
          
          const R_pulse = R * pulseRadii;
          const a_pulse = a * pulseRadii;
          
          const tx = mouse3Dx + R_pulse * cosT + a_pulse * Math.cos(phi) * cosT + cosT * clampedRadial;
          const ty = mouse3Dy + R_pulse * sinT + a_pulse * Math.cos(phi) * sinT + sinT * clampedRadial;
          const tz = restZ[i] + clampedZ;

          const lerpSpeed = 0.15;
          const newX = curX[i] + (tx - curX[i]) * lerpSpeed;
          const newY = curY[i] + (ty - curY[i]) * lerpSpeed;
          const newZ = curZ[i] + (tz - curZ[i]) * lerpSpeed;
          
          const maxDistFromRest = 4.0;
          const dx = newX - restX[i];
          const dy = newY - restY[i];
          const dz = newZ - restZ[i];
          const distFromRest = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distFromRest > maxDistFromRest) {
            const scale = maxDistFromRest / distFromRest;
            curX[i] = restX[i] + dx * scale;
            curY[i] = restY[i] + dy * scale;
            curZ[i] = restZ[i] + dz * scale;
          } else {
            curX[i] = newX;
            curY[i] = newY;
            curZ[i] = newZ;
          }
          
          posAttr.setXYZ(i, curX[i], curY[i], curZ[i]);
        }
      }

      posAttr.needsUpdate = true;
      if (frameCount % 8 === 0) {
        geo.computeVertexNormals();
      }
      geo.computeBoundingSphere();

      drawCapsules(time, mouse3Dx, mouse3Dy);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      cancelAnimationFrame(requestRef);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      <canvas
        ref={canvas2DRef}
        className="absolute inset-0 pointer-events-none z-[2]"
      />
    </div>
  );
};
