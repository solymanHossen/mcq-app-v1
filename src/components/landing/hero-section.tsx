"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Check,
  MoreHorizontal,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"

export function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = React.useState(false)
  const [timerText, setTimerText] = React.useState("01:42:15")

  // Live timer tick simulation
  React.useEffect(() => {
    let seconds = 15
    let minutes = 42
    let hours = 1

    const interval = setInterval(() => {
      seconds--
      if (seconds < 0) {
        seconds = 59
        minutes--
        if (minutes < 0) {
          minutes = 59
          hours--
        }
      }
      const pad = (n: number) => n.toString().padStart(2, "0")
      setTimerText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden bg-background text-foreground pt-24 pb-16 sm:pt-28 sm:pb-20 lg:min-h-[700px] lg:pt-32 lg:pb-20 flex items-center">
      {/* Dynamic Ambient Background Glows on Left Side */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -left-20 -z-10 h-[38rem] w-[48rem] rounded-full bg-chart-2/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/4 -z-10 h-[34rem] w-[42rem] rounded-full bg-primary/10 blur-[130px]"
      />

      {/* The reference keeps the copy on a quiet canvas and gives the image its own half of the hero. */}
      <div className="absolute bottom-0 right-0 -z-10 h-[46%] w-full overflow-hidden lg:inset-y-0 lg:h-auto lg:w-[45%]">
        <Image
          src="/images/hero-students-v2.jpg"
          alt="Students taking online exam collaboratively"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-background/45 to-background lg:hidden" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6 xl:gap-10">
          
          {/* ================= LEFT COLUMN: HERO COPY ================= */}
          <div className="relative z-10 py-4 sm:py-6 lg:col-span-6 lg:py-8 lg:pr-10">
            <div className="relative max-w-xl">
              <h1 className="relative max-w-[620px] font-heading text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-[3.8rem] xl:text-[4.25rem] leading-[1.08]">
                The Elite Standard
                <span className="block mt-1 font-extrabold">
                  for <span className="text-primary">Online</span>
                </span>
                <span className="block mt-1 text-primary">
                  Examinations
                </span>
              </h1>

              <p className="relative mt-5 max-w-lg text-base font-medium text-muted-foreground sm:text-lg sm:leading-relaxed">
                Empower your institution with a secure, intuitive, and frictionless
                testing platform built for the modern era.
              </p>

              {/* Action Buttons */}
              <div className="relative mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg active:scale-95"
                >
                  <span>Get Started Free</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="group inline-flex items-center justify-center rounded-full border border-border bg-card/60 px-7 py-3 text-base font-medium text-foreground shadow-xs transition-all duration-300 hover:bg-card hover:shadow active:scale-95"
                >
                  <span>Watch Video</span>
                </button>
              </div>

            </div>
          </div>

          {/* ================= RIGHT COLUMN: FLOATING INTERACTIVE GLASS UI CARDS ================= */}
          <div className="relative z-10 min-h-[380px] sm:min-h-[440px] lg:absolute lg:inset-y-0 lg:right-0 lg:w-[45%] lg:min-h-0">
            
            {/* ---------------- CARD 1: TOP RIGHT (VERIFICATION COMPLETED) WITH WORLD-CLASS GLASS EFFECT ---------------- */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-32 lg:right-6 z-20 transition-transform duration-300 hover:scale-105">
              <div className="relative overflow-hidden flex items-center gap-3 rounded-2xl border border-white/70 dark:border-white/20 bg-white/55 dark:bg-card/45 p-3 sm:px-3.5 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_10px_35px_0_rgba(15,23,42,0.12),inset_0_1px_1px_0_rgba(255,255,255,0.95)] ring-1 ring-black/[0.03] text-card-foreground">
                {/* Specular glass edge line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                {/* Facial Scan Avatar */}
                <div className="relative flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl border border-chart-4/80 bg-white/50 dark:bg-muted/40 p-0.5 shadow-xs">
                  <div className="relative size-full overflow-hidden rounded-lg">
                    <Image
                      src="/images/avatar-verify.jpg"
                      alt="Verified candidate"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Corner checkmark badge */}
                  <span className="absolute -bottom-1 -right-1 flex size-3.5 sm:size-4 items-center justify-center rounded-full bg-chart-4 text-primary-foreground shadow-xs">
                    <Check className="size-2 sm:size-2.5 stroke-[3]" />
                  </span>
                </div>

                {/* Info Text & Status Bars */}
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-card-foreground tracking-tight">
                    Verification Completed
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    Progress
                  </span>
                  <div className="mt-1.5 flex flex-col gap-1 w-24 sm:w-28">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-muted">
                      <div className="h-full w-[80%] rounded-full bg-chart-4" />
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-muted">
                      <div className="h-full w-[45%] rounded-full bg-chart-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- CARD 2: BOTTOM LEFT / CENTER OVERLAP (EXAM IN PROGRESS) WITH WORLD-CLASS GLASS EFFECT ---------------- */}
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 lg:bottom-10 lg:-left-20 z-30 max-w-[calc(100%-1rem)] w-[265px] sm:w-[310px] transition-transform duration-300 hover:scale-102">
              <div className="relative overflow-hidden flex flex-col gap-3 rounded-2xl border border-white/70 dark:border-white/20 bg-white/60 dark:bg-card/50 p-4 sm:p-5 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_12px_40px_0_rgba(15,23,42,0.14),inset_0_1px_1px_0_rgba(255,255,255,0.95)] ring-1 ring-black/[0.03] text-card-foreground">
                {/* Specular glass edge line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Exam in Progress</span>
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Options"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>

                {/* Timer Clock */}
                <div className="py-0.5">
                  <span className="font-mono text-2xl font-bold tracking-wider text-card-foreground">
                    {timerText}
                  </span>
                </div>

                {/* Live Question Check Items */}
                <div className="flex flex-col gap-2 border-t border-black/10 dark:border-border/60 pt-2.5">
                  <div className="flex items-center justify-between text-xs text-card-foreground font-medium">
                    <span className="flex items-center gap-2">
                      <span className="flex size-3.5 items-center justify-center rounded-full bg-chart-4/15 text-chart-4">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                      Live question 1
                    </span>
                    <span className="size-2 rounded-full bg-chart-4" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-card-foreground font-medium">
                    <span className="flex items-center gap-2">
                      <span className="flex size-3.5 items-center justify-center rounded-full bg-chart-4/15 text-chart-4">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                      Live question 2
                    </span>
                    <span className="size-2 rounded-full bg-chart-4" />
                  </div>
                </div>

                {/* Bottom AI Proctoring Active Pill */}
                <div className="mt-1 flex items-center justify-center gap-2 rounded-full bg-chart-4/15 border border-chart-4/30 py-1.5 px-3 backdrop-blur-md">
                  <span className="size-2 rounded-full bg-chart-4" />
                  <span className="text-xs font-semibold text-chart-4">
                    AI proctoring active
                  </span>
                </div>
              </div>
            </div>

            {/* ---------------- CARD 3: BOTTOM RIGHT (INSIGHTS & ANALYTICS) WITH WORLD-CLASS GLASS EFFECT ---------------- */}
            <div className="hidden sm:block absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:bottom-8 lg:right-6 z-20 w-[240px] sm:w-[275px] transition-transform duration-300 hover:scale-102">
              <div className="relative overflow-hidden flex flex-col gap-2.5 rounded-2xl border border-white/70 dark:border-white/20 bg-white/60 dark:bg-card/50 p-3.5 sm:p-4 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_10px_35px_0_rgba(15,23,42,0.12),inset_0_1px_1px_0_rgba(255,255,255,0.95)] ring-1 ring-black/[0.03] text-card-foreground">
                {/* Specular glass edge line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Insights &amp; Analytics</span>
                </div>

                {/* Clean Multi-Curve SVG Line Chart */}
                <div className="relative mt-1">
                  <svg
                    viewBox="0 0 240 70"
                    className="w-full h-16 overflow-visible"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="themeAreaGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="themeAreaGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Faint Guide Lines */}
                    <line x1="28" y1="12" x2="235" y2="12" stroke="var(--color-border)" strokeDasharray="2 3" opacity="0.6" />
                    <line x1="28" y1="32" x2="235" y2="32" stroke="var(--color-border)" strokeDasharray="2 3" opacity="0.6" />
                    <line x1="28" y1="52" x2="235" y2="52" stroke="var(--color-border)" strokeDasharray="2 3" opacity="0.6" />

                    {/* Left Axis Labels */}
                    <text x="0" y="14" fill="var(--color-muted-foreground)" fontSize="8" fontFamily="monospace">200</text>
                    <text x="0" y="34" fill="var(--color-muted-foreground)" fontSize="8" fontFamily="monospace">100</text>
                    <text x="5" y="54" fill="var(--color-muted-foreground)" fontSize="8" fontFamily="monospace">0</text>

                    {/* Area fills */}
                    <path
                      d="M 30 52 Q 75 46, 115 22 T 185 44 T 235 32 L 235 56 L 30 56 Z"
                      fill="url(#themeAreaGrad1)"
                    />
                    <path
                      d="M 30 48 Q 65 18, 100 40 T 170 30 T 235 22 L 235 56 L 30 56 Z"
                      fill="url(#themeAreaGrad2)"
                    />

                    {/* Chart-2 Wave Line */}
                    <path
                      d="M 30 48 Q 65 18, 100 40 T 170 30 T 235 22"
                      stroke="var(--color-chart-2)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Primary Wave Line */}
                    <path
                      d="M 30 52 Q 75 46, 115 22 T 185 44 T 235 32"
                      stroke="var(--color-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Chart-4 Wave Line */}
                    <path
                      d="M 30 38 Q 80 54, 125 34 T 195 22 T 235 14"
                      stroke="var(--color-chart-4)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Bottom Months Labels */}
                    <text x="32" y="66" fill="var(--color-muted-foreground)" fontSize="7" fontFamily="sans-serif">Jan</text>
                    <text x="72" y="66" fill="var(--color-muted-foreground)" fontSize="7" fontFamily="sans-serif">Feb</text>
                    <text x="112" y="66" fill="var(--color-muted-foreground)" fontSize="7" fontFamily="sans-serif">Mar</text>
                    <text x="152" y="66" fill="var(--color-muted-foreground)" fontSize="7" fontFamily="sans-serif">Apr</text>
                    <text x="192" y="66" fill="var(--color-muted-foreground)" fontSize="7" fontFamily="sans-serif">May</text>
                    <text x="222" y="66" fill="var(--color-muted-foreground)" fontSize="7" fontFamily="sans-serif">Jun</text>
                  </svg>
                </div>

                {/* Metrics Progress Section */}
                <div className="flex flex-col gap-1.5 border-t border-black/10 dark:border-border/60 pt-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Security Level</span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/10 dark:bg-muted">
                      <div className="h-full w-[94%] rounded-full bg-chart-4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Integrity Rating</span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/10 dark:bg-muted">
                      <div className="h-full w-[98%] rounded-full bg-chart-2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Attendance</span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/10 dark:bg-muted">
                      <div className="h-full w-[99%] rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Preview Dialog */}
      {isVideoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  ExamHub Platform Tour &amp; Proctoring Demo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="rounded-full border border-border bg-muted/40 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Interactive video preview canvas */}
            <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/20 flex flex-col items-center justify-center text-center p-8">
              <div className="size-20 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center text-primary shadow-xs mb-4">
                <ShieldCheck className="size-10 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground">
                Secure &amp; Intuitive Examination Environment
              </h4>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Experience high-precision facial biometric verification, continuous tab-switch detection, and real-time auto-grading.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/register"
                  onClick={() => setIsVideoOpen(false)}
                  className="rounded-full bg-primary hover:bg-primary/90 px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
                >
                  Start Free Trial
                </Link>
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(false)}
                  className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
