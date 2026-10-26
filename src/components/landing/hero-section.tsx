"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Check,
  MoreHorizontal,
  Play,
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

      {/* Background image positioned on right half so hero copy rests on a quiet canvas */}
      <div className="absolute bottom-0 right-0 -z-10 h-[46%] w-full overflow-hidden lg:inset-y-0 lg:h-auto lg:w-[48%]">
        <Image
          src="/images/hero-students-v2.jpg"
          alt="Students taking online exam collaboratively"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[68%_center]"
        />
        {/* Soft edge blend for desktop and mobile veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent lg:hidden" />
        <div className="hidden lg:block absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6 xl:gap-10">
          
          {/* ================= LEFT COLUMN: HERO COPY (NO GLASS EFFECT) ================= */}
          <div className="relative z-10 py-4 sm:py-6 lg:py-8 lg:pr-6">
            <div className="relative max-w-xl text-foreground">
              <h1 className="relative max-w-[580px] font-heading text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.85rem] font-extrabold tracking-tight text-foreground leading-[1.08]">
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
                  className="group relative inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg active:scale-95"
                >
                  <span>Get Started Free</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-card/80 hover:bg-card pl-3.5 pr-6 py-2.5 text-base font-medium text-foreground shadow-xs transition-all duration-300 hover:shadow hover:border-foreground/20 active:scale-95"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Play className="size-3.5 fill-current ml-0.5" />
                  </span>
                  <span>Watch Video</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: EXAM IN PROGRESS FLOATING UI CARD ================= */}
          <div className="relative z-10 min-h-[360px] sm:min-h-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:w-[48%] lg:min-h-0">
            {/* ---------------- EXAM IN PROGRESS (EXACT SAME TO SAME) ---------------- */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6 sm:left-6 sm:translate-x-0 lg:bottom-12 lg:-left-10 z-30 max-w-[calc(100%-2rem)] w-[290px] sm:w-[320px] transition-transform duration-300 hover:scale-102">
              <div className="relative overflow-hidden flex flex-col rounded-[24px] border border-black/[0.06] dark:border-white/10 bg-white dark:bg-card p-5 sm:p-6 shadow-[0_20px_45px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.03] text-card-foreground">
                {/* Header: Title + Rounded 3-dots Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-[16px] sm:text-[17px] font-bold text-slate-900 dark:text-foreground tracking-tight">
                    Exam in Progress
                  </span>
                  <div
                    className="flex h-6 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-muted/80 text-slate-500 hover:bg-slate-200/80 transition-colors cursor-pointer"
                    aria-label="Card options"
                  >
                    <MoreHorizontal className="w-4 h-3.5 stroke-[2.5]" />
                  </div>
                </div>

                {/* Big Bold Clock Timer (Proportional Sans-serif) */}
                <div className="mt-2.5 mb-1.5">
                  <span className="font-heading text-[36px] sm:text-[40px] font-extrabold tracking-tight leading-none text-slate-950 dark:text-white">
                    {timerText}
                  </span>
                </div>

                {/* Faint Divider Line */}
                <div className="h-px w-full bg-slate-100 dark:bg-border/60 my-3.5" />

                {/* Live Question Check Items */}
                <div className="flex flex-col gap-3">
                  {/* Question 1 */}
                  <div className="flex items-center justify-between text-[14.5px] sm:text-[15px] font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e8f7ee] dark:bg-emerald-950/50 text-[#1e8e5a] dark:text-emerald-400">
                        <Check className="size-3.5 stroke-[2.4]" />
                      </span>
                      <span>Live question 1</span>
                    </div>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2da46f] text-white shadow-2xs">
                      <Check className="size-3.5 stroke-[2.8]" />
                    </span>
                  </div>

                  {/* Question 2 */}
                  <div className="flex items-center justify-between text-[14.5px] sm:text-[15px] font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e8f7ee] dark:bg-emerald-950/50 text-[#1e8e5a] dark:text-emerald-400">
                        <Check className="size-3.5 stroke-[2.4]" />
                      </span>
                      <span>Live question 2</span>
                    </div>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2da46f] text-white shadow-2xs">
                      <Check className="size-3.5 stroke-[2.8]" />
                    </span>
                  </div>
                </div>

                {/* Bottom AI Proctoring Active Pill (Left aligned, pill capsule) */}
                <div className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-[#daf0e3] dark:bg-emerald-950/60 py-1.5 px-3 sm:py-2 sm:px-3.5 self-start">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2da46f] text-white shadow-2xs">
                    <Check className="size-3 stroke-[2.8]" />
                  </span>
                  <span className="text-[13px] sm:text-[13.5px] font-semibold text-[#145738] dark:text-emerald-300 tracking-tight">
                    AI proctoring active
                  </span>
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
