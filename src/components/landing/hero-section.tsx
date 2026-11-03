"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Clock,
  GraduationCap,
  Play,
  TrendingUp,
  Users,
  X,
} from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { SystemSettings } from "@/modules/settings/queries"
import type { PopularHeroExam } from "@/modules/exams/queries"

function getEmbedVideoUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v")
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`
        : null
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`
        : null
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0]
      return videoId
        ? `https://player.vimeo.com/video/${videoId}?autoplay=1`
        : null
    }
  } catch {
    return null
  }
  return null
}

function renderHighlightedTitle(title?: string | null) {
  if (!title?.trim()) {
    return (
      <>
        The Elite Standard
        <span className="mt-1 sm:mt-2 block font-extrabold">
          for <span className="text-primary">Online</span>
        </span>
        <span className="mt-1 sm:mt-2 block text-primary">Examinations</span>
      </>
    )
  }

  const raw = title.trim()
  const hasMarkup = /\{([^}]+)\}|\[([^\]]+)\]|\*([^*]+)\*/.test(raw)

  if (hasMarkup) {
    const lines = raw.split("\n")
    return (
      <>
        {lines.map((line, lineIdx) => {
          const parts: React.ReactNode[] = []
          const regex = /\{([^}]+)\}|\[([^\]]+)\]|\*([^*]+)\*/g
          let lastIndex = 0
          let match: RegExpExecArray | null

          while ((match = regex.exec(line)) !== null) {
            if (match.index > lastIndex) {
              parts.push(line.slice(lastIndex, match.index))
            }
            const word = match[1] || match[2] || match[3]
            parts.push(
              <span
                key={`hl-${lineIdx}-${match.index}`}
                className="font-extrabold text-primary"
              >
                {word}
              </span>
            )
            lastIndex = regex.lastIndex
          }

          if (lastIndex < line.length) {
            parts.push(line.slice(lastIndex))
          }

          return (
            <span
              key={lineIdx}
              className={lineIdx > 0 ? "mt-1 sm:mt-2 block" : "inline"}
            >
              {parts}
            </span>
          )
        })}
      </>
    )
  }

  // Fallback: If no explicit markup, highlight "Online" and "Examinations" if present
  if (/online|examinations/i.test(raw)) {
    const parts = raw.split(/(online|examinations)/i)
    return (
      <>
        {parts.map((part, idx) => {
          if (/^(online|examinations)$/i.test(part)) {
            return (
              <span key={idx} className="font-extrabold text-primary">
                {part}
              </span>
            )
          }
          return part
        })}
      </>
    )
  }

  return raw
}

export interface HeroSectionProps {
  settings?: Partial<SystemSettings> | null
  popularExams?: PopularHeroExam[]
}

export function HeroSection({
  settings,
  popularExams = [],
}: HeroSectionProps = {}) {
  const heroImage =
    settings?.heroImageUrl?.trim() || "/images/hero-students.webp"
  const heroVideo =
    settings?.heroVideoUrl?.trim() ||
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  const embedVideoUrl = getEmbedVideoUrl(heroVideo)

  // Use top 2 attempted exams with graceful fallback
  const firstExam: PopularHeroExam = popularExams[0] ?? {
    id: "explore",
    title: "Computer Science Assessment",
    durationMinutes: 30,
    passingMarks: 50,
    teacherName: "Faculty Instructor",
    institution: null,
    totalAttempts: 12,
    questionCount: 15,
  }

  const secondExam: PopularHeroExam = popularExams[1] ?? {
    id: "explore",
    title: "Engineering Aptitude Test",
    durationMinutes: 45,
    passingMarks: 60,
    teacherName: "Academic Board",
    institution: null,
    totalAttempts: 8,
    questionCount: 20,
  }

  return (
    <section
      aria-labelledby="home-title"
      className="relative isolate bg-background pt-28 pb-8 text-foreground sm:pt-32 sm:pb-12 lg:pt-36 lg:pb-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
            <div className="flex flex-col gap-4 sm:gap-5">
              <h1
                id="home-title"
                className="max-w-2xl font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.12] sm:leading-[1.08] wrap-anywhere whitespace-pre-line text-balance text-foreground"
              >
                {renderHighlightedTitle(settings?.heroTitle)}
              </h1>
              <p className="max-w-xl text-base leading-relaxed wrap-anywhere text-muted-foreground/90 sm:text-lg lg:text-xl">
                {settings?.heroSubtitle?.trim() ||
                  "Empower your institution with a secure, intuitive, and frictionless testing platform built for the modern era."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                size="lg"
                className="w-full rounded-xl font-semibold shadow-xs sm:w-auto sm:rounded-xl"
              >
                <Link href="/teachers">
                  <GraduationCap data-icon="inline-start" />
                  <span>Teacher List</span>
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-xl border-border/70 bg-card font-semibold shadow-xs sm:w-auto sm:rounded-xl"
                  >
                    <Play data-icon="inline-start" />
                    <span>Tour Our Work Process</span>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  aria-describedby={undefined}
                  className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl gap-0 overflow-hidden rounded-2xl border border-border/70 bg-black p-0 shadow-xs ring-0 sm:max-w-4xl"
                >
                  <DialogTitle className="sr-only">
                    Platform Walkthrough Video
                  </DialogTitle>
                  <div className="relative flex aspect-video max-h-[calc(100dvh-2rem)] w-full items-center justify-center overflow-hidden bg-black">
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
                        className="size-full object-contain"
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
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-lg"
                      className="absolute top-3 right-3 rounded-xl shadow-xs sm:rounded-xl"
                      aria-label="Close"
                    >
                      <X />
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative min-w-0 py-6 sm:py-8 lg:py-6">
            {/* Main Students Hero Image with Master Reference Border & Radius */}
            <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-muted/20 shadow-md">
              <Image
                src={heroImage}
                alt="Students taking online exam collaboratively"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
                className="object-cover object-center"
                unoptimized={
                  heroImage.startsWith("/uploads/") ||
                  heroImage.startsWith("http")
                }
              />
            </div>

            {/* Master Reference Card 1: Top-Left Floating Minimal Card */}
            <Link
              href={firstExam.id === "explore" ? "/exam-list" : `/exam/${firstExam.id}`}
              className="group absolute -top-3 left-1.5 sm:-top-4 sm:-left-3 lg:-top-6 lg:-left-6 xl:-top-7 xl:-left-8 z-20 w-[240px] xs:w-[260px] sm:w-[285px] lg:w-[310px] rounded-2xl border border-border/80 bg-card/90 sm:bg-card/95 p-2.5 sm:p-3.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl"
              aria-label={`View top assessment: ${firstExam.title}`}
            >
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Top Assessment</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                  <Users className="size-3 text-muted-foreground/80 shrink-0" />
                  <span>{firstExam.totalAttempts} attempted</span>
                </span>
              </div>

              <h3
                className="font-heading text-xs sm:text-sm font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors"
                title={firstExam.title}
              >
                {firstExam.title}
              </h3>

              <div className="mt-2 sm:mt-2.5 flex items-center justify-between gap-2 border-t border-border/50 pt-1.5 sm:pt-2 text-[10px] sm:text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                  <GraduationCap className="size-3 sm:size-3.5 text-primary shrink-0" />
                  <span className="truncate font-medium text-foreground/85">
                    {firstExam.teacherName}
                  </span>
                </div>
                <div className="flex size-5 sm:size-6 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground shrink-0 shadow-2xs">
                  <ArrowRight className="size-2.5 sm:size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>

            {/* Master Reference Card 2: Bottom-Right Floating Minimal Card */}
            <Link
              href={secondExam.id === "explore" ? "/exam-list" : `/exam/${secondExam.id}`}
              className="group absolute -bottom-3 right-1.5 sm:-bottom-4 sm:-right-3 lg:-bottom-6 lg:-right-6 xl:-bottom-7 xl:-right-8 z-20 w-[240px] xs:w-[260px] sm:w-[285px] lg:w-[310px] rounded-2xl border border-border/80 bg-card/90 sm:bg-card/95 p-2.5 sm:p-3.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl"
              aria-label={`View assessment: ${secondExam.title}`}
            >
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-primary">
                  <TrendingUp className="size-3 shrink-0" />
                  <span>Trending Test</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                  <Clock className="size-3 text-muted-foreground/80 shrink-0" />
                  <span>{secondExam.durationMinutes} mins</span>
                </span>
              </div>

              <h3
                className="font-heading text-xs sm:text-sm font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors"
                title={secondExam.title}
              >
                {secondExam.title}
              </h3>

              <div className="mt-2 sm:mt-2.5 flex items-center justify-between gap-2 border-t border-border/50 pt-1.5 sm:pt-2 text-[10px] sm:text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                  <GraduationCap className="size-3 sm:size-3.5 text-primary shrink-0" />
                  <span className="truncate font-medium text-foreground/85">
                    {secondExam.teacherName}
                  </span>
                </div>
                <div className="flex size-5 sm:size-6 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground shrink-0 shadow-2xs">
                  <ArrowRight className="size-2.5 sm:size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
