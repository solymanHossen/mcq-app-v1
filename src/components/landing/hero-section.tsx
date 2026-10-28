"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  CheckCircle2,
  GraduationCap,
  MoreHorizontal,
  Play,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { SystemSettings } from "@/modules/settings/queries"

function getEmbedVideoUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v")
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` : null
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` : null
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0]
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : null
    }
  } catch {
    return null
  }
  return null
}

export interface HeroSectionProps {
  settings?: Partial<SystemSettings> | null
}

export function HeroSection({ settings }: HeroSectionProps = {}) {
  const [timerText, setTimerText] = React.useState("01:42:15")

  const heroImage = settings?.heroImageUrl?.trim() || "/images/hero-students-v2.jpg"
  const heroVideo = settings?.heroVideoUrl?.trim() || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  const embedVideoUrl = getEmbedVideoUrl(heroVideo)

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
    <section className="relative isolate flex min-h-[auto] flex-col justify-center overflow-hidden bg-background pt-20 pb-14 text-foreground sm:min-h-[92vh] sm:pt-28 sm:pb-20 lg:min-h-[700px] lg:pt-32 lg:pb-20">
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
      <div className="absolute right-0 bottom-0 -z-10 h-[48%] w-full overflow-hidden sm:h-[46%] lg:inset-y-0 lg:h-auto lg:w-[48%]">
        <Image
          src={heroImage}
          alt="Students taking online exam collaboratively"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[68%_center]"
          unoptimized={heroImage.startsWith("/uploads/") || heroImage.startsWith("http")}
        />
        {/* Soft edge blend for desktop and mobile veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent lg:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-28 bg-gradient-to-r from-background to-transparent lg:block" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6 xl:gap-10">
          {/* ================= LEFT COLUMN: HERO COPY (NO GLASS EFFECT) ================= */}
          <div className="relative z-10 py-3 sm:py-6 lg:py-8 lg:pr-6">
            <div className="relative max-w-xl text-foreground">
              {settings?.heroTitle ? (
                <h1 className="relative max-w-[580px] font-heading text-[32px] leading-[1.12] font-extrabold tracking-tight text-foreground min-[400px]:text-[36px] sm:text-5xl sm:leading-[1.08] lg:text-[3.5rem] xl:text-[3.85rem]">
                  {settings.heroTitle}
                </h1>
              ) : (
                <h1 className="relative max-w-[580px] font-heading text-[32px] leading-[1.12] font-extrabold tracking-tight text-foreground min-[400px]:text-[36px] sm:text-5xl sm:leading-[1.08] lg:text-[3.5rem] xl:text-[3.85rem]">
                  The Elite Standard
                  <span className="mt-1 block font-extrabold">
                    for <span className="text-primary">Online</span>
                  </span>
                  <span className="mt-1 block text-primary">Examinations</span>
                </h1>
              )}

              <p className="relative mt-4 max-w-lg text-[15px] font-medium text-muted-foreground sm:mt-5 sm:text-lg sm:leading-relaxed">
                {settings?.heroSubtitle?.trim() ||
                  "Empower your institution with a secure, intuitive, and frictionless testing platform built for the modern era."}
              </p>

              {/* Action Buttons */}
              <div className="relative mt-7 flex flex-col items-stretch gap-3 min-[480px]:flex-row min-[480px]:items-center sm:mt-8 sm:gap-5">
                <Link
                  href="/teachers"
                  className="group relative inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary py-2.5 pr-6 pl-4 text-[15px] font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg active:scale-95 min-[480px]:w-auto sm:py-3 sm:text-base"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground transition-all duration-300 group-hover:scale-105 group-hover:bg-primary-foreground/30">
                    <GraduationCap className="size-4" />
                  </span>
                  <span>Teacher List</span>
                  <ArrowRight className="size-4 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="group inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-border/80 bg-card/80 py-2.5 pr-6 pl-3.5 text-[15px] font-semibold text-foreground shadow-xs transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-md active:scale-95 min-[480px]:w-auto sm:py-3 sm:text-base"
                    >
                      <span className="flex size-7.5 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                        <Play className="ml-0.5 size-3.5 fill-current" />
                      </span>
                      <span>Tour Our Work Process</span>
                    </button>
                  </DialogTrigger>

                  <DialogContent
                    showCloseButton={false}
                    className="w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-2xl border border-white/15 bg-slate-950 p-0 text-white shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_80px_rgba(59,130,246,0.18)] ring-1 ring-white/10 backdrop-blur-2xl sm:w-[94vw] sm:max-w-4xl sm:rounded-3xl md:w-[90vw] md:max-w-5xl lg:w-[86vw] lg:max-w-5xl xl:max-w-6xl"
                  >
                    {/* Radiant Top Edge Accent */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

                    <DialogHeader className="sr-only">
                      <DialogTitle>ExamHub Platform Walkthrough</DialogTitle>
                      <DialogDescription>
                        Watch how ExamHub works with instant auto-grading,
                        proctored examinations, and real-time student analytics.
                      </DialogDescription>
                    </DialogHeader>

                    {/* macOS / SaaS Cinematic Header Bar */}
                    <div className="flex h-14 items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 backdrop-blur-md sm:h-16 sm:px-6">
                      {/* Left: Window Dots + Live Badge + Title */}
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <DialogClose asChild>
                            <button
                              type="button"
                              className="group/dot relative flex size-3.5 cursor-pointer items-center justify-center rounded-full bg-[#ff5f57] transition-transform hover:brightness-110 active:scale-90"
                              aria-label="Close modal"
                            >
                              <X className="size-2 stroke-[3] text-black/80 opacity-0 transition-opacity group-hover/dot:opacity-100" />
                            </button>
                          </DialogClose>
                          <span className="size-3.5 rounded-full bg-[#febc2e]" />
                          <span className="size-3.5 rounded-full bg-[#28c840]" />
                        </div>

                        <div className="hidden h-4 w-px bg-white/15 sm:block" />

                        <div className="flex items-center gap-2.5 truncate">
                          <span className="relative flex size-2 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                          </span>
                          <span className="truncate text-xs font-semibold tracking-tight text-white/95 sm:text-sm">
                            ExamHub Platform Tour
                          </span>
                          <span className="hidden items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/80 md:inline-flex">
                            Interactive Walkthrough
                          </span>
                        </div>
                      </div>

                      {/* Right: ESC Hint + Modern Close Button */}
                      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <span className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-white/50 sm:inline-flex">
                          ESC to exit
                        </span>
                        <DialogClose asChild>
                          <button
                            type="button"
                            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95 sm:size-9"
                            aria-label="Close modal"
                          >
                            <X className="size-4 stroke-[2.2]" />
                          </button>
                        </DialogClose>
                      </div>
                    </div>

                    {/* 16:9 Video Player Frame */}
                    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black">
                      {embedVideoUrl ? (
                        <iframe
                          src={embedVideoUrl}
                          title="ExamHub Platform Walkthrough"
                          className="size-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          key={heroVideo}
                          className="block size-full object-contain"
                          controls
                          autoPlay
                          playsInline
                          preload="metadata"
                          src={heroVideo}
                        >
                          Your browser does not support video playback.
                        </video>
                      )}
                    </div>

                    {/* Cinematic Footer Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-900/90 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-3.5">
                      <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 sm:gap-6 sm:text-[13px]">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="size-4 text-emerald-400" />
                          <span>Anti-cheat Proctoring</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Zap className="size-4 text-amber-400" />
                          <span>Instant Auto-Grading</span>
                        </span>
                        <span className="hidden items-center gap-1.5 sm:flex">
                          <CheckCircle2 className="size-4 text-sky-400" />
                          <span>Live Leaderboard</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Link
                          href="/teachers"
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 sm:text-sm"
                        >
                          <span>Explore Teachers</span>
                          <ArrowRight className="size-3.5 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: EXAM IN PROGRESS FLOATING UI CARD ================= */}
          <div className="relative z-10 min-h-[360px] sm:min-h-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:min-h-0 lg:w-[48%]">
            {/* ---------------- EXAM IN PROGRESS (EXACT SAME TO SAME) ---------------- */}
            <div className="absolute bottom-4 left-1/2 z-30 w-[290px] max-w-[calc(100%-2rem)] -translate-x-1/2 transition-transform duration-300 hover:scale-102 sm:bottom-6 sm:left-6 sm:w-[320px] sm:translate-x-0 lg:bottom-12 lg:-left-10">
              <div className="relative flex flex-col overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-5 text-card-foreground shadow-[0_20px_45px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.03] sm:p-6 dark:border-white/10 dark:bg-card">
                {/* Header: Title + Rounded 3-dots Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-bold tracking-tight text-slate-900 sm:text-[17px] dark:text-foreground">
                    Exam in Progress
                  </span>
                  <div
                    className="flex h-6 w-9 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200/80 dark:bg-muted/80"
                    aria-label="Card options"
                  >
                    <MoreHorizontal className="h-3.5 w-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* Big Bold Clock Timer (Proportional Sans-serif) */}
                <div className="mt-2.5 mb-1.5">
                  <span className="font-heading text-[36px] leading-none font-extrabold tracking-tight text-slate-950 sm:text-[40px] dark:text-white">
                    {timerText}
                  </span>
                </div>

                {/* Faint Divider Line */}
                <div className="my-3.5 h-px w-full bg-slate-100 dark:bg-border/60" />

                {/* Live Question Check Items */}
                <div className="flex flex-col gap-3">
                  {/* Question 1 */}
                  <div className="flex items-center justify-between text-[14.5px] font-medium text-slate-800 sm:text-[15px] dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e8f7ee] text-[#1e8e5a] dark:bg-emerald-950/50 dark:text-emerald-400">
                        <Check className="size-3.5 stroke-[2.4]" />
                      </span>
                      <span>Live question 1</span>
                    </div>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2da46f] text-white shadow-2xs">
                      <Check className="size-3.5 stroke-[2.8]" />
                    </span>
                  </div>

                  {/* Question 2 */}
                  <div className="flex items-center justify-between text-[14.5px] font-medium text-slate-800 sm:text-[15px] dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e8f7ee] text-[#1e8e5a] dark:bg-emerald-950/50 dark:text-emerald-400">
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
                <div className="mt-3.5 inline-flex items-center gap-2 self-start rounded-full bg-[#daf0e3] px-3 py-1.5 sm:px-3.5 sm:py-2 dark:bg-emerald-950/60">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2da46f] text-white shadow-2xs">
                    <Check className="size-3 stroke-[2.8]" />
                  </span>
                  <span className="text-[13px] font-semibold tracking-tight text-[#145738] sm:text-[13.5px] dark:text-emerald-300">
                    AI proctoring active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
