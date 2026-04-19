/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight, CreditCard, Globe, Menu, ShieldCheck, Users, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrustLayer } from "./components/TrustLayer";
import { ParticleBackground } from "./components/ParticleBackground";

const navItems = [
  { label: "Problem", href: "#problem" },
  { label: "Infrastructure", href: "#infrastructure" },
  { label: "Shift", href: "#shift" },
];

const fears = [
  {
    icon: CreditCard,
    title: "Financial Uncertainty",
    text: "Cross-border payments, unclear billing, and no safety net if outcomes fail.",
  },
  {
    icon: ShieldCheck,
    title: "Clinical Opacity",
    text: "No structured records a local dentist can verify or continue with.",
  },
  {
    icon: Users,
    title: "Emotional Isolation",
    text: "Surgery abroad can feel isolating, even when clinically safe.",
  },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sectionHeadingClass = "text-4xl md:text-6xl font-light tracking-tight";
  const sectionSubheadingClass = "text-4xl font-semibold leading-[1.05] tracking-tight";
  const sectionTextClass = "text-xl font-normal leading-relaxed text-muted-foreground";

  const fadeInUp = {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
  };

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent/30 selection:text-accent">
      <nav className="fixed top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Globe className="h-5 w-5 text-accent" />
              </div>
              <span className="text-base font-bold tracking-tight">The Doctour Project</span>
            </a>
            <div className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button size="sm" className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/90" onClick={() => jumpTo("apply")}>
              Apply for Certification
            </Button>
            <button className="flex h-8 w-8 items-center justify-center lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 top-14 w-full border-b border-border/30 bg-background px-6 py-8 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="text-2xl font-semibold" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
              <Separator />
              <Button className="w-full rounded-full bg-accent py-6 text-lg" onClick={() => { setIsMenuOpen(false); jumpTo("apply"); }}>
                Apply for Certification
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center sm:px-6">
        <ParticleBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="z-10 flex max-w-6xl flex-col items-center gap-4 sm:gap-6"
        >
          <p className="text-xs font-semibold normal-case tracking-normal text-black sm:text-sm">
            The Doctour Project
          </p>
          <h1 className="max-w-6xl whitespace-normal text-[2.002rem] leading-[1.0000] tracking-[-0.03em] sm:text-[2.548rem] md:text-[7.28rem] md:tracking-[-0.04em]">
            Stop losing international patients to the trust gap
          </h1>
          <p className="max-w-4xl text-center text-base sm:text-xl">
            Turn hesitation into confirmed bookings
          </p>
          <Button id="apply" size="lg" className="mt-6 h-[38px] rounded-full bg-foreground px-[22px] text-[11px] text-background shadow-xl transition-all hover:scale-[1.02] hover:bg-foreground/90 sm:h-[45px] sm:px-8 sm:text-[13px]" onClick={() => jumpTo("apply")}>
            Apply for Certification
          </Button>
        </motion.div>
      </section>

      <section id="problem" className="py-64 md:py-80">
        <div className="container">
          <motion.div {...fadeInUp} className="mb-64 max-w-5xl text-left md:mb-80">
            <h2 className={`${sectionHeadingClass} max-w-5xl`}>Price Attracts. Trust Converts.</h2>
            <p className={`${sectionTextClass} mt-4 max-w-5xl`}>Patients rarely say no. They pause on one question: Can I trust this with my health? Behind each inquiry sit three silent fears:</p>
          </motion.div>

          <div className="space-y-64 md:space-y-80">
            {fears.map((item) => (
              <motion.div key={item.title} {...fadeInUp} className="max-w-5xl">
                <div className="text-left">
                  <h3 className={`mb-3 ${sectionSubheadingClass}`}>{item.title}</h3>
                  <p className={`${sectionTextClass} max-w-[24rem]`}>{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div id="infrastructure">
        <TrustLayer />
      </div>

      <section id="shift" className="bg-secondary/20 py-64 md:py-80">
        <div className="container">
          <div className="space-y-64 md:space-y-80">
            <motion.div {...fadeInUp} className="text-center">
              <h2 className={sectionHeadingClass}>This Isn&apos;t a Feature Set. It&apos;s a Positioning Shift.</h2>
              <p className={`${sectionTextClass} mx-auto mt-6 max-w-4xl`}>
                The next wave of medical tourism will not be won on price. It will be won on credibility, continuity, and confidence.
              </p>
            </motion.div>

            <motion.div {...fadeInUp} className="text-center">
              <h3 className={sectionSubheadingClass}>Join the Clinics Redefining Global Dental Care</h3>
              <Button size="lg" className="mt-8 h-12 rounded-full bg-foreground px-7 text-sm text-background shadow-xl transition-all hover:scale-[1.02] hover:bg-foreground/90 sm:h-14 sm:px-10 sm:text-base" onClick={() => jumpTo("apply")}>
                Apply for Certification <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 bg-background py-20">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-accent" />
                <span className="text-xl font-bold">The Doctour Project</span>
              </div>
            </div>
            <div className="flex gap-16">
              <div>
                <h4 className="mb-6 text-[10px] font-bold uppercase tracking-widest">Explore</h4>
                <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                  <li><a href="#problem" className="hover:text-accent">Problem</a></li>
                  <li><a href="#infrastructure" className="hover:text-accent">Infrastructure</a></li>
                  <li><a href="#shift" className="hover:text-accent">Shift</a></li>
                </ul>
              </div>
            </div>
          </div>
          <Separator className="my-12 opacity-30" />
          <div className="flex flex-col justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:flex-row">
            <p>© 2026 The Doctour Project</p>
            <div className="flex gap-8">
              <span>Global Care Corridor</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}