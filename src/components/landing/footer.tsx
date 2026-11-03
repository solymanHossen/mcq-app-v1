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
} from "lucide-react"

import { APP_NAME } from "@/lib/config"
import { BrandLogo } from "@/components/shared/brand-logo"

// Social media SVG icons matching Lucide 24x24 geometry
function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="X (Twitter)">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="LinkedIn">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="Facebook">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="YouTube">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

const FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: "Public Exam List", href: "/exam-list" },
      { label: "Verified Faculty", href: "/teachers", badge: "Live" },
      { label: "Platform Services", href: "/services" },
      { label: "Candidate Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company & Support",
    links: [
      { label: "About ExamHub", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Apply as Faculty", href: "/teachers/apply" },
    ],
  },
  {
    title: "Trust & Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security & Proctoring", href: "/services" },
    ],
  },
] as const

export interface FooterSocialLinks {
  githubUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  facebookUrl?: string | null
  youtubeUrl?: string | null
  contactEmail?: string | null
}

export interface FooterProps {
  logoUrl?: string | null
  socialLinks?: FooterSocialLinks | null
}

export function Footer({ logoUrl, socialLinks }: FooterProps = {}) {
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

  // Dynamic social channels based on superadmin settings (consumer/public only, no developer platforms)
  const rawSocials = [
    {
      name: "Facebook",
      href: socialLinks?.facebookUrl?.trim() || (socialLinks ? "" : "https://facebook.com"),
      icon: FacebookIcon,
      isConfigured: Boolean(socialLinks?.facebookUrl?.trim()),
    },
    {
      name: "YouTube",
      href: socialLinks?.youtubeUrl?.trim() || (socialLinks ? "" : "https://youtube.com"),
      icon: YouTubeIcon,
      isConfigured: Boolean(socialLinks?.youtubeUrl?.trim()),
    },
    {
      name: "X (Twitter)",
      href: socialLinks?.twitterUrl?.trim() || "https://twitter.com",
      icon: TwitterXIcon,
      isConfigured: Boolean(socialLinks?.twitterUrl?.trim()),
    },
    {
      name: "LinkedIn",
      href: socialLinks?.linkedinUrl?.trim() || "https://linkedin.com",
      icon: LinkedInIcon,
      isConfigured: Boolean(socialLinks?.linkedinUrl?.trim()),
    },
  ]
  const activeSocials = rawSocials.filter((s) => s.href.length > 0)

  return (
    <footer className="relative isolate border-t border-border/80 bg-gradient-to-b from-background via-background/95 to-muted/30 dark:to-muted/10 text-foreground overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-[54rem] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 -z-10 h-64 w-80 rounded-full bg-chart-2/[0.08] blur-[120px]"
      />

      {/* Radiant Top Edge Accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12">
        {/* ================= TOP CARD: NEWSLETTER ================= */}
        <div className="relative mb-14 sm:mb-16 overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card/95 to-primary/[0.06] dark:to-primary/[0.12] p-6 sm:p-8 lg:p-10 shadow-xs hover:shadow-md transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Subtle Ambient Corner Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full bg-primary/[0.08] blur-3xl dark:bg-primary/[0.14]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -left-16 size-48 rounded-full bg-emerald-500/[0.05] blur-2xl"
          />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3.5 shadow-2xs ring-1 ring-primary/20">
                <Mail className="size-3.5" />
                <span>ExamHub Dispatch</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl lg:text-[30px] font-extrabold tracking-tight text-foreground leading-tight">
                Stay updated with modern examinations
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
                Get notified about newly published exams, verified question bank updates, and academic features.
              </p>
            </div>

            <div className="w-full">
              {isSubscribed ? (
                <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0 shadow-xs">
                    <Check className="size-4.5 stroke-[3]" />
                  </span>
                  <div>
                    <p className="text-sm sm:text-base font-bold font-heading">You&apos;re subscribed!</p>
                    <p className="text-xs sm:text-sm text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-0.5">
                      Thanks for joining ExamHub Dispatch.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground/60 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full h-12 rounded-xl border border-border/80 bg-background/90 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 shadow-2xs transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-6 font-heading text-sm font-bold text-primary-foreground shadow-xs transition-all hover:shadow-md active:scale-98 disabled:opacity-70 shrink-0 cursor-pointer"
                  >
                    <span>{isSubmitting ? "Subscribing..." : "Subscribe"}</span>
                    <ArrowRight className="size-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </form>
              )}
              <div className="flex items-center gap-1.5 mt-2.5 text-xs text-muted-foreground/75 pl-1 font-medium">
                <Lock className="size-3 shrink-0 text-muted-foreground/60" />
                <span>Zero spam. Unsubscribe anytime with one click.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CLEAN NAVIGATION GRID ================= */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-12 pb-14">
          
          {/* Brand Identity Column (Takes 2 Columns on Large Screens) */}
          <div className="lg:col-span-2 flex flex-col gap-5 lg:pr-8">
            <Link
              href="/"
              className="group inline-flex items-center transition-opacity hover:opacity-95"
              title={APP_NAME}
            >
              <BrandLogo logoUrl={logoUrl} className="h-9 sm:h-10 w-auto" />
            </Link>

            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
              The premier platform for high-stakes online examinations, verified faculty question
              banking, AI-driven explanations, and automated integrity proctoring.
            </p>

            {/* Dynamic Social Channels */}
            <div className="flex items-center gap-2 pt-1">
              {activeSocials.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className="flex size-9.5 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-2xs transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Category Columns (3 Columns) */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="col-span-1 flex flex-col gap-3.5">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-muted-foreground font-medium transition-all duration-150 hover:text-foreground hover:translate-x-0.5"
                    >
                      <span>{link.label}</span>
                      {"badge" in link && link.badge && (
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary leading-none transition-transform group-hover:scale-105 shadow-2xs">
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

        {/* ================= BOTTOM BAR ================= */}
        <div className="border-t border-border/80 pt-8 flex flex-col-reverse gap-6 lg:flex-row lg:items-center lg:justify-between text-xs text-muted-foreground">
          {/* Left: Copyright */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 font-medium">
            <span>
              &copy; {new Date().getFullYear()} {APP_NAME}, Inc. All rights reserved.
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="text-muted-foreground/80">
              Dedicated to academic integrity &amp; excellence.
            </span>
          </div>

          {/* Center: Trust Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-muted-foreground shadow-2xs">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Anti-Cheat Verified</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-muted-foreground shadow-2xs">
              <Lock className="size-3.5 text-primary" />
              <span>Encrypted Assessment</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-muted-foreground shadow-2xs">
              <Globe className="size-3.5 text-primary" />
              <span>Global Availability</span>
            </span>
          </div>

          {/* Right: Back to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:border-border transition-all shadow-2xs hover:shadow-xs active:scale-95 w-fit cursor-pointer"
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
