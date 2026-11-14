"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Package,
  CheckCircle2,
  Bot,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Scale,
  Zap,
  Users,
  Building2,
  FileCheck2,
  Smartphone,
  ChevronRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Lenis smooth scroll + GSAP ScrollTrigger integration
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Hero entrance animations
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.9 } });
    heroTl
      .fromTo(
        ".hero-badge",
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1 }
      )
      .fromTo(
        ".hero-title",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0 },
        "-=0.4"
      )
      .fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0 },
        "-=0.5"
      )
      .fromTo(
        ".hero-cta",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1 },
        "-=0.4"
      )
      .fromTo(
        ".hero-metric",
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.08 },
        "-=0.3"
      );

    // Scroll-triggered section animations
    const sections = sectionRefs.current.filter(Boolean) as HTMLElement[];
    sections.forEach((section, i) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Staggered children animation
      const cards = section.querySelectorAll(".animate-stagger > *");
      if (cards.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    // Floating gradient orbs animation
    gsap.to(".orb-1", {
      x: "+=40",
      y: "+=30",
      rotation: 360,
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: "none",
    });
    gsap.to(".orb-2", {
      x: "-=30",
      y: "-=20",
      rotation: -360,
      duration: 25,
      repeat: -1,
      yoyo: true,
      ease: "none",
    });

    // Text scramble effect for hero title (subtle)
    const titleSpans = document.querySelectorAll(".hero-title .scramble");
    titleSpans.forEach((span, i) => {
      gsap.fromTo(
        span,
        { opacity: 0, filter: "blur(8px)", scale: 0.8 },
        {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: 0.6,
          delay: i * 0.03,
          ease: "power2.out",
        }
      );
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.remove(() => lenis.raf(0));
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm ring-1 ring-emerald-500/30">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight leading-none flex items-center gap-1.5">
                TIJORI
                <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1 py-0.2 text-[0.62rem] font-semibold text-emerald-800 dark:text-emerald-300 tracking-wider">
                  ESCROW
                </span>
              </span>
              <span className="text-[0.65rem] text-muted-foreground font-medium tracking-wide">
                UPI Protection Network
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#panchayat-ai" className="hover:text-foreground transition-colors">
              Panchayat AI
            </a>
            <a href="#security" className="hover:text-foreground transition-colors">
              Security & Compliance
            </a>
            <a href="#for-who" className="hover:text-foreground transition-colors">
              Solutions
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm">
                  Go to Dashboard
                  <ChevronRight className="size-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm font-semibold">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero Section ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-4" ref={(el) => { if (el) sectionRefs.current[0] = el; }}>
          {/* Subtle Ambient Radial Gradients - animated orbs */}
          <div className="orb-1 absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 size-[600px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
          <div className="orb-2 absolute top-1/3 right-1/4 -z-10 size-[400px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 shadow-sm backdrop-blur-sm">
              <Sparkles className="size-3.5 text-emerald-600" />
              <span>India&apos;s Regulated UPI Escrow for Freelancers &amp; Agencies</span>
            </div>

            <h1 className="hero-title text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
              <span className="scramble">Pehle kaam,</span> <br className="hidden sm:inline" />
              <span className="scramble bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                phir daam.
              </span>
            </h1>

            <p className="hero-subtitle text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Never get ghosted after delivering work. Clients fund the contract securely via UPI into
              Tijori Escrow. Funds are released instantly when milestones are approved.
            </p>

            <div className="flex flex-wrap gap-3.5 justify-center pt-2">
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                <Button size="lg" className="hero-cta bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 h-12 shadow-md shadow-emerald-900/15 gap-2">
                  Start Securing Deals
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="hero-cta border-border text-sm px-6 h-12 hover:bg-muted/60">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Metrics Trust Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 border-t border-border/80 max-w-3xl mx-auto text-left">
              <div className="hero-metric space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">₹14.2 Cr+</div>
                <div className="text-xs text-muted-foreground">Escrow Protected</div>
              </div>
              <div className="hero-metric space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">99.8%</div>
                <div className="text-xs text-muted-foreground">Dispute-Free Releases</div>
              </div>
              <div className="hero-metric space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">&lt; 2 mins</div>
                <div className="text-xs text-muted-foreground">Instant UPI Settlement</div>
              </div>
              <div className="hero-metric space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">24/7 AI</div>
                <div className="text-xs text-muted-foreground">Panchayat Arbitration</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem & Solution Matrix ────────────────────────────── */}
        <section id="for-who" className="py-20 px-4 bg-muted/30 border-y border-border/60" ref={(el) => { if (el) sectionRefs.current[1] = el; }}>
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                The Trust Gap
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">The Old Way vs. The Tijori Way</h2>
              <p className="text-sm text-muted-foreground">
                Freelancing in India has always suffered from mutual mistrust. Tijori fixes it permanently.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 animate-stagger">
              {/* For Freelancers */}
              <Card className="border-border shadow-sm">
                <CardContent className="p-6 space-y-5">
                  <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">For Freelancers &amp; Agencies</h3>
                    <p className="text-xs text-muted-foreground mt-1">Stop chasing pending invoices on WhatsApp.</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 border border-red-200/60">
                      <span className="text-base shrink-0">❌</span>
                      <span>Client delays payment for weeks after final files are delivered.</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border border-emerald-200/60">
                      <span className="text-base shrink-0">✅</span>
                      <span><strong>Tijori Solution:</strong> Client deposits 100% in UPI escrow upfront. You work with total financial security.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* For Clients */}
              <Card className="border-border shadow-sm">
                <CardContent className="p-6 space-y-5">
                  <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 flex items-center justify-center">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">For Clients &amp; Startups</h3>
                    <p className="text-xs text-muted-foreground mt-1">Hire top talent without fear of unfinished projects.</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50/60 dark:bg-red-950/30 text-red-900 dark:text-red-200 border border-red-200/60">
                      <span className="text-base shrink-0">❌</span>
                      <span>Paid 50% advance to an unknown freelancer who disappeared without completing the scope.</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 border border-blue-200/60">
                      <span className="text-base shrink-0">✅</span>
                      <span><strong>Tijori Solution:</strong> Your money remains locked in escrow until you review and approve the agreed deliverable.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── How It Works (4 Steps) ──────────────────────────────── */}
        <section id="how-it-works" className="py-24 px-4" ref={(el) => { if (el) sectionRefs.current[2] = el; }}>
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Process
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How Tijori Escrow Works</h2>
              <p className="text-sm text-muted-foreground">
                Four frictionless steps designed around standard Indian UPI habits.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative animate-stagger">
              {[
                {
                  step: "01",
                  title: "Draft Escrow Deal",
                  desc: "Seller specifies deliverables, revisions limit, and total amount (₹). Generates a secure share link.",
                  icon: FileCheck2,
                },
                {
                  step: "02",
                  title: "Client Funds Escrow",
                  desc: "Client opens link on phone or laptop, scans UPI QR or pays via GPay/PhonePe into Tijori Escrow.",
                  icon: Lock,
                },
                {
                  step: "03",
                  title: "Deliver & Audit",
                  desc: "Freelancer completes the agreed work and submits source links or files directly into the deal thread.",
                  icon: Package,
                },
                {
                  step: "04",
                  title: "Release & Settle",
                  desc: "Client verifies the deliverable and taps 'Accept'. Payment releases directly to freelancer's bank account.",
                  icon: CheckCircle2,
                },
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col p-6 rounded-2xl border border-border bg-card/60 space-y-4 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center">
                      <item.icon className="size-5" />
                    </div>
                    <span className="text-2xl font-black text-muted-foreground/30 font-mono">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Panchayat AI Section ─────────────────────────────────── */}
        <section id="panchayat-ai" className="py-20 px-4 bg-gradient-to-b from-muted/40 via-muted/20 to-background border-t border-border/60" ref={(el) => { if (el) sectionRefs.current[3] = el; }}>
          <div className="max-w-4xl mx-auto">
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-card shadow-lg">
              <CardContent className="p-8 sm:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 flex items-center justify-center shrink-0 ring-1 ring-amber-300">
                      <Bot className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">Panchayat AI™ Arbitration</h3>
                      <p className="text-xs text-muted-foreground">Automated neutral dispute evaluation for freelance contracts</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 text-xs">
                    Patent Pending AI Engine
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  In the rare event of a disagreement, you don&apos;t need expensive legal recourse.
                  <strong> Panchayat AI</strong> objectively reads the original agreed scope, inspects the seller&apos;s
                  submitted deliverables, and analyzes the buyer&apos;s specific grievance. Within seconds, it suggests
                  an equitable resolution (Full Release, Full Refund, or Pro-Rata Split) with human arbitrator oversight.
                </p>

                <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs animate-stagger">
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Scope Verification
                    </span>
                    <p className="text-[0.72rem] text-muted-foreground">
                      Validates deliverables against the signed contract specifications.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-semibold text-amber-700 flex items-center gap-1">
                      <Scale className="size-3.5" /> Fair Pro-Rata Splits
                    </span>
                    <p className="text-[0.72rem] text-muted-foreground">
                      Calculates partial milestone payments if 40% or 60% of work was completed.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-semibold text-blue-700 flex items-center gap-1">
                      <ShieldCheck className="size-3.5" /> Human Arbitrator
                    </span>
                    <p className="text-[0.72rem] text-muted-foreground">
                      Platform compliance officer reviews and confirms the AI recommendation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Security & Compliance Strip ─────────────────────────── */}
        <section id="security" className="py-20 px-4 border-t border-border/80" ref={(el) => { if (el) sectionRefs.current[4] = el; }}>
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Institutional Safety
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Bank-Grade Escrow Security</h2>
              <p className="text-sm text-muted-foreground">
                Every rupee is routed through regulated banking nodal accounts with end-to-end encryption.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 animate-stagger">
              <div className="p-6 rounded-2xl bg-card border border-border space-y-3 text-center sm:text-left">
                <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-bold text-base">RBI Compliant Escrow</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Operated in strict adherence with RBI guidelines for digital escrow and intermediary accounts.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-3 text-center sm:text-left">
                <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="size-5" />
                </div>
                <h3 className="font-bold text-base">Direct UPI Rails</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Support for Google Pay, PhonePe, Paytm, BHIM, and net-banking with instant IMPS/NEFT settlement.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-3 text-center sm:text-left">
                <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center">
                  <Lock className="size-5" />
                </div>
                <h3 className="font-bold text-base">Tamper-Proof Audit Trail</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Immutable chronological log of payment receipts, deliverables, and approval events.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ─────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gradient-to-br from-emerald-900 to-teal-950 text-white relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Ready to secure your next project?
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
              Join thousands of Indian freelancers and agencies building trustworthy business relationships with Tijori.
            </p>
            <div className="pt-2">
              <Link href="/register">
                <Button size="lg" className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-8 shadow-lg text-sm">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Enterprise Footer ────────────────────────────────────── */}
      <footer className="border-t border-border/80 bg-card py-12 px-4 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="size-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-foreground">TIJORI ESCROW</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Trustless milestone escrow infrastructure for the Indian freelance and digital services economy.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-foreground">Escrow Dashboard</Link></li>
              <li><Link href="/deals/new" className="hover:text-foreground">Contract Builder</Link></li>
              <li><a href="#panchayat-ai" className="hover:text-foreground">Panchayat AI™</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">UPI Settlement</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Security &amp; Legal</h4>
            <ul className="space-y-2">
              <li><a href="#security" className="hover:text-foreground">Escrow Compliance</a></li>
              <li><span className="hover:text-foreground cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Grievance Redressal</span></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-foreground cursor-pointer">About Us</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Agency Partnerships</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Developers / API</span></li>
              <li><span className="hover:text-foreground cursor-pointer">Contact Support</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.7rem]">
          <span>© 2026 Tijori Technologies Private Limited. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600" />
              Bank-grade 256-bit Encryption
            </span>
            <span>·</span>
            <span>Made for India&apos;s Independent Creators 🇮🇳</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
