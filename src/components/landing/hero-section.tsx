"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  GraduationCap,
  MoreHorizontal,
  Play,
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
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { SystemSettings } from "@/modules/settings/queries"

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
        <span className="mt-1 block font-extrabold">
          for <span className="text-primary">Online</span>
        </span>
        <span className="mt-1 block text-primary">Examinations</span>
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
              className={lineIdx > 0 ? "mt-1 block" : "inline"}
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
}

export function HeroSection({ settings }: HeroSectionProps = {}) {
  const [timerText, setTimerText] = React.useState("01:42:15")

  const heroImage =
    settings?.heroImageUrl?.trim() || "/images/hero-students-v2.jpg"
  const heroVideo =
    settings?.heroVideoUrl?.trim() ||
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
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
    <section className="relative isolate overflow-hidden bg-background pt-24 pb-8 text-foreground sm:pt-28 sm:pb-12 lg:min-h-[720px] lg:pt-36 lg:pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 items-center gap-8 lg:min-h-[520px] lg:grid-cols-2">
          <div className="relative z-10 min-w-0 space-y-6 lg:py-8 lg:pr-12">
            <div className="space-y-5">
              <h1 className="max-w-xl font-heading text-4xl leading-tight font-extrabold tracking-tight text-balance text-foreground sm:text-5xl xl:text-6xl">
                {renderHighlightedTitle(settings?.heroTitle)}
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                {settings?.heroSubtitle?.trim() ||
                  "Empower your institution with a secure, intuitive, and frictionless testing platform built for the modern era."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                className="h-12 rounded-full px-5 text-sm font-semibold shadow-xs"
              >
                <Link href="/teachers">
                  <GraduationCap data-icon="inline-start" />
                  Teacher List
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border-border/70 bg-card px-5 text-sm font-semibold shadow-xs"
                  >
                    <Play data-icon="inline-start" />
                    Tour Our Work Process
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="w-full max-w-4xl p-0 overflow-hidden rounded-2xl border border-border/70 bg-black shadow-2xl ring-0 gap-0"
                >
                  <DialogTitle className="sr-only">
                    Platform Walkthrough Video
                  </DialogTitle>
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="absolute top-3 right-3 z-30 flex size-8 items-center justify-center rounded-full bg-black/70 text-white/90 hover:bg-black hover:text-white backdrop-blur-md transition-all shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                      aria-label="Close"
                    >
                      <X className="size-4" />
                      <span className="sr-only">Close</span>
                    </button>
                  </DialogClose>
                  <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
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
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative min-w-0 pb-4 lg:static lg:pb-0">
            <div className="relative h-80 overflow-hidden rounded-2xl bg-muted/20 sm:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:-z-10 lg:h-full lg:w-1/2 lg:rounded-none">
              <Image
                src={heroImage}
                alt="Students taking online exam collaboratively"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center lg:object-[60%_center]"
                unoptimized={
                  heroImage.startsWith("/uploads/") ||
                  heroImage.startsWith("http")
                }
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 hidden w-28 bg-gradient-to-r from-background to-transparent lg:block"
              />
            </div>
            <Card className="relative z-10 mx-4 -mt-24 max-w-sm gap-0 rounded-2xl border border-border/70 bg-card py-0 shadow-sm ring-0 sm:mx-6 lg:absolute lg:bottom-12 lg:left-[47%] lg:mx-0 lg:mt-0 lg:w-80">
              <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 pt-5">
                <CardTitle className="text-base font-bold tracking-tight">
                  Exam in Progress
                </CardTitle>
                <MoreHorizontal
                  className="size-4 text-muted-foreground"
                  aria-label="Card options"
                />
              </CardHeader>
              <CardContent className="space-y-4 p-5 pt-3">
                <p className="font-heading text-4xl font-extrabold tracking-tight text-foreground">
                  {timerText}
                </p>
                <Separator />
                <div className="space-y-3">
                  {[1, 2].map((number) => (
                    <div
                      key={number}
                      className="flex items-center justify-between gap-3 text-sm font-medium"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-primary" />
                        Live question {number}
                      </span>
                      <Check className="size-4 shrink-0 text-primary" />
                    </div>
                  ))}
                </div>
                <Badge
                  variant="secondary"
                  className="max-w-full gap-1.5 rounded-full whitespace-normal"
                >
                  <Check className="size-3.5 shrink-0 text-primary" />
                  AI proctoring active
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
