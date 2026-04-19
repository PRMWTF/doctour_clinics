import { motion, useScroll, useTransform } from "motion/react";
import { ShieldCheck, FileText, Lock, CheckCircle2, Activity, Users } from "lucide-react";
import { useRef } from "react";

export function TrustLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const progressHeight = useTransform(scrollYProgress, [0.3, 0.7], ["0%", "100%"]);
  const sectionHeadingClass = "text-4xl md:text-6xl font-light tracking-tight";
  const sectionSubheadingClass = "text-4xl font-semibold leading-[1.05] tracking-tight";
  const sectionTextClass = "text-xl font-normal leading-relaxed text-muted-foreground";

  return (
    <section ref={containerRef} className="bg-background overflow-hidden relative py-0">
      <div className="container">
        <div className="mb-64 flex w-full flex-col items-center text-center md:mb-80">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mx-auto flex w-full max-w-5xl flex-col items-center text-center"
          >
            <p className="w-full whitespace-nowrap text-[2.002rem] leading-[1.0000] tracking-[-0.03em] font-[420] text-foreground sm:text-[2.548rem] md:text-[7.28rem] md:tracking-[-0.04em]">
              New-Age Infrastructure
            </p>
            <h2 className={`${sectionHeadingClass} mb-6 whitespace-nowrap text-foreground`}>
              Traceable Surgery Documented Security
            </h2>
            <p className={`${sectionTextClass} whitespace-nowrap`}>Clinical transparency, built for lifelong continuity</p>
          </motion.div>
        </div>

        <div className="space-y-64 md:space-y-80">

        {/* Section 1: Maintenance Blueprint */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/10">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Module 01</span>
            </div>
            
            <h3 className={`mb-4 ${sectionSubheadingClass}`}>1. FHIR-Compliant Digital Treatment Passport</h3>
            <p className={sectionTextClass}>Clinical transparency for lifelong care</p>
            <p className={`${sectionTextClass} mt-4`}>Procedure IDs, care milestones, and key clinical metrics captured and shareable</p>
            <p className={`${sectionTextClass} mt-2`}>HL7 FHIR structure for seamless cross-provider continuity</p>
            <p className={`${sectionTextClass} mt-2`}>Lifelong, verifiable medical treatment record</p>
            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Outcome</p>
            <p className="mt-2 text-xl font-normal leading-relaxed text-foreground">You become part of the local-care ecosystem, not an external risk.</p>
          </motion.div>

          {/* Right: Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-[34rem] lg:ml-auto lg:justify-self-end"
          >
            <div className="glass rounded-3xl p-8 border border-white/40 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Case ID</p>
                  <p className="text-sm font-mono font-medium">DT-2026-INT-882</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Live Document</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Treatment Pathway</p>
                  <p className="text-sm font-semibold">Advanced Care Protocol</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Clinical Milestone</p>
                  <p className="text-sm font-semibold">Phase 2 Complete</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Record Number</p>
                  <p className="text-sm font-mono">AU-9921-XQ</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Care Team</p>
                  <p className="text-sm font-semibold">Verified Multidisciplinary</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border/30 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">Verified Clinical Continuity</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Payments */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/10">
                <Lock className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Module 02</span>
            </div>

            <h3 className={`mb-4 ${sectionSubheadingClass}`}>2. Milestone-Based Escrow Architecture</h3>
            <p className={sectionTextClass}>Protected payments. Verified outcomes.</p>
            <p className={`${sectionTextClass} mt-4`}>Funds secured in a neutral, regulated escrow layer</p>
            <p className={`${sectionTextClass} mt-2`}>Release only on verified clinical milestones</p>
            <p className={`${sectionTextClass} mt-2`}>Transparent pricing with no hidden costs</p>
            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Outcome</p>
            <p className="mt-2 text-xl font-normal leading-relaxed text-foreground">Patients feel financially secure. Clinics receive assured, performance-linked payments.</p>
          </motion.div>

          {/* Right: Demo Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-[34rem] lg:ml-auto lg:justify-self-end"
          >
            <div className="glass rounded-3xl p-8 border border-white/40 shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-8">Payment Phases</p>
              
              {/* Progress Line */}
              <div className="relative pl-8">
                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-border/30">
                  <motion.div 
                    style={{ height: progressHeight }}
                    className="w-full bg-accent"
                  />
                </div>

                <div className="space-y-10">
                  {[
                    { phase: "Phase 1", percent: "10% Retainer", title: "Pre-Departure Triage", desc: "Once specialist approves suitability." },
                    { phase: "Phase 2", percent: "40% Milestone", title: "The Surgical Step", desc: "Released after titanium posts are verified." },
                    { phase: "Phase 3", percent: "50% Completion", title: "The Final Fitting", desc: "Released when satisfied." }
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[29px] top-1 h-6 w-6 rounded-full bg-background border-2 border-border flex items-center justify-center hover:border-accent transition-colors cursor-pointer">
                        <div className="h-2 w-2 rounded-full bg-border hover:bg-accent transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{item.phase}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">• {item.percent}</span>
                        </div>
                        <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 3: Trust Network */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Module 03</span>
            </div>

            <h3 className={`mb-4 ${sectionSubheadingClass}`}>3. Peer-to-Peer Trust Network</h3>
            <p className={sectionTextClass}>From solo travel to shared confidence</p>
            <p className={`${sectionTextClass} mt-4`}>Smart pairing of international patients from the same city</p>
            <p className={`${sectionTextClass} mt-2`}>Access to verified alumni mentors with similar procedures</p>
            <p className={`${sectionTextClass} mt-2`}>Built-in reassurance before, during, and after travel</p>
            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Outcome</p>
            <p className="mt-2 text-xl font-normal leading-relaxed text-foreground">Lower anxiety, higher booking intent.</p>
          </motion.div>

          {/* Right: Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-[34rem] lg:ml-auto lg:justify-self-end"
          >
            <div className="glass rounded-3xl p-8 border border-white/40 shadow-2xl">
              <div className="flex justify-center">
                <div className="w-full max-w-[18rem]">
                  <svg viewBox="0 0 256 256" className="h-auto w-full" role="img" aria-label="Peer-to-peer trust icon">
                    <circle cx="85" cy="73" r="14" fill="#d1d5db" />
                    <circle cx="171" cy="73" r="14" fill="#d1d5db" />
                    <path
                      d="M40 154 C40 98 96 92 128 154 C160 216 216 210 216 154 C216 98 160 92 128 154 C96 216 40 210 40 154"
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth="13"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
}
