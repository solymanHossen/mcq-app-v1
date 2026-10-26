"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUp,
  Check,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { APP_NAME } from "@/lib/config"

// Social media SVG icons matching Lucide 24x24 geometry
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="GitHub"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="X (Twitter)"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="LinkedIn"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="Discord"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

const FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: "Question Bank", href: "/#features" },
      { label: "Exam Runner", href: "/#features" },
      { label: "AI Proctoring", href: "/#features", badge: "Live" },
      { label: "Auto-Grading", href: "/#features" },
      { label: "Leaderboards & XP", href: "/#features" },
      { label: "Mistake Explanations", href: "/#features" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Teacher Directory", href: "/teachers", badge: "Verified" },
      { label: "Universities & Colleges", href: "/#enterprise" },
      { label: "High Schools & K-12", href: "/#enterprise" },
      { label: "Coding Bootcamps", href: "/#enterprise" },
      { label: "Certification Bodies", href: "/#enterprise" },
      { label: "Enterprise Scale", href: "/#enterprise" },
    ],
  },
  {
    title: "Developers & API",
    links: [
      { label: "Interactive API Docs", href: "/api-docs", badge: "v1.0" },
      { label: "Canvas LMS Sync", href: "/#enterprise" },
      { label: "SSO & SAML 2.0", href: "/#enterprise" },
      { label: "Webhooks Architecture", href: "/api-docs" },
      { label: "High-Throughput SLA", href: "/#enterprise" },
      { label: "System Health", href: "/#features" },
    ],
  },
  {
    title: "Security & Trust",
    links: [
      { label: "FERPA & Data Isolation", href: "/#enterprise" },
      { label: "SOC 2 Type II Security", href: "/#enterprise" },
      { label: "Academic Integrity Code", href: "/#features" },
      { label: "Proctoring Ethics", href: "/#features" },
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
    ],
  },
] as const

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    href: "https://github.com",
    icon: GithubIcon,
  },
  {
    name: "X (Twitter)",
    href: "https://twitter.com",
    icon: TwitterXIcon,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: LinkedInIcon,
  },
  {
    name: "Discord",
    href: "https://discord.com",
    icon: DiscordIcon,
  },
] as const

export function Footer() {
  const [email, setEmail] = React.useState("")
  const [isSubscribed, setIsSubscribed] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubscribed(true)
      setEmail("")
    }, 600)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative isolate border-t border-border/80 bg-background text-foreground overflow-hidden">
      {/* Dynamic Ambient Background Glows mirroring Hero Section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 -z-10 h-64 w-80 rounded-full bg-chart-2/10 blur-[120px]"
      />

      {/* Radiant Top Edge Accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12">
        {/* ================= TOP CARD: MODERN DISPATCH & NEWSLETTER ================= */}
        <div className="relative mb-16 rounded-3xl border border-border/80 bg-card/85 p-6 sm:p-8 lg:p-10 shadow-xs backdrop-blur-2xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3.5">
                <Mail className="size-3.5" />
                <span>ExamHub Dispatch</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Stay ahead in modern examination technology
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                Receive quarterly deep-dives into anti-cheat neural algorithms, automated
                grading benchmarks, and verified question bank releases.
              </p>
            </div>

            <div className="w-full">
              {isSubscribed ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0">
                    <Check className="size-4 stroke-[3]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">You&apos;re in the loop!</p>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                      Thanks for subscribing to ExamHub Dispatch.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your institution or work email..."
                      className="w-full h-12 rounded-xl border border-border bg-background/80 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 shadow-2xs transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow active:scale-98 disabled:opacity-70 shrink-0"
                  >
                    <span>{isSubmitting ? "Subscribing..." : "Subscribe"}</span>
                    <ArrowRight className="size-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </form>
              )}
              <p className="mt-2 text-xs text-muted-foreground/75 pl-1">
                Zero spam. Institutional grade privacy. Unsubscribe with 1-click anytime.
              </p>
            </div>
          </div>
        </div>

        {/* ================= MAIN 5-COLUMN NAVIGATION GRID ================= */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6 lg:gap-10 pb-16">
          
          {/* Brand Identity Column (Takes 2 Columns on Large Screens) */}
          <div className="col-span-2 flex flex-col gap-5 lg:pr-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 transition-opacity hover:opacity-95"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background shadow-xs transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="size-5" />
              </span>
              <span className="font-heading text-xl sm:text-[22px] font-bold tracking-tight text-foreground">
                {APP_NAME}
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The elite standard for high-stakes online examinations, verified question
              banking, AI-driven explanations, and frictionless automated proctoring.
            </p>

            {/* Live Operational Status Widget */}
            <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md w-fit">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-foreground font-semibold">Systems Normal</span>
              <span className="text-border">|</span>
              <span className="text-emerald-600 dark:text-emerald-400">99.99% Uptime</span>
            </div>

            {/* Social Channels */}
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-card/60 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-95"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Category Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="col-span-1 flex flex-col gap-3.5">
              <h4 className="font-heading text-xs sm:text-sm font-semibold uppercase tracking-wider text-foreground">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span>{link.label}</span>
                      {"badge" in link && link.badge && (
                        <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary leading-none transition-transform group-hover:scale-105">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ================= BOTTOM BAR: COMPLIANCE, COPYRIGHT & BACK TO TOP ================= */}
        <div className="border-t border-border/80 pt-8 flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
          {/* Left: Copyright */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span>
              &copy; {new Date().getFullYear()} {APP_NAME}, Inc. All rights reserved.
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="text-muted-foreground/80">
              Engineered for academic integrity &amp; reliability.
            </span>
          </div>

          {/* Center / Security Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>SOC 2 Type II</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary" />
              <span>FERPA Compliant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-primary" />
              <span>256-bit Encrypted</span>
            </span>
          </div>

          {/* Right: Back to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/80 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 hover:border-foreground/20 transition-all shadow-2xs hover:shadow-xs active:scale-95 w-fit"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}
