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
    <section
      aria-labelledby="home-title"
      className="relative isolate bg-background pt-28 pb-8 text-foreground sm:pt-32 sm:pb-12 lg:pt-36 lg:pb-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h1
                id="home-title"
                className="max-w-xl font-heading text-2xl leading-tight font-extrabold tracking-tight wrap-anywhere whitespace-pre-line text-balance text-foreground sm:text-3xl lg:text-4xl"
              >
                {renderHighlightedTitle(settings?.heroTitle)}
              </h1>
              <p className="max-w-lg text-sm leading-relaxed wrap-anywhere text-muted-foreground sm:text-base">
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
          <div className="relative min-w-0">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/70 bg-muted/20 shadow-xs">
              <Image
                src={heroImage}
                alt="Students taking online exam collaboratively"
                fill
                preload
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
                className="object-cover object-center"
                unoptimized={
                  heroImage.startsWith("/uploads/") ||
                  heroImage.startsWith("http")
                }
              />
            </div>
            <Card className="relative mx-4 -mt-6 min-w-0 gap-0 rounded-2xl border border-border/70 bg-card py-0 shadow-xs ring-0 sm:mx-6">
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-6 sm:py-4.5">
                <CardTitle className="text-base font-bold tracking-tight">
                  <h2>Exam in Progress</h2>
                </CardTitle>
                <MoreHorizontal
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-6 sm:p-6">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-1">
                  <p className="font-heading text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {timerText}
                  </p>
                  <Badge
                    variant="secondary"
                    className="h-auto max-w-full gap-1.5 rounded-full whitespace-normal"
                  >
                    <Check data-icon="inline-start" className="shrink-0 text-primary" />
                    AI proctoring active
                  </Badge>
                </div>
                <Separator className="sm:hidden" />
                <Separator orientation="vertical" className="hidden h-auto self-stretch sm:block" />
                <div className="flex min-w-0 flex-col justify-center gap-3 sm:flex-1">
                  {[1, 2].map((number) => (
                    <div
                      key={number}
                      className="flex items-center justify-between gap-3 text-sm font-medium"
                    >
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <Check className="size-4 shrink-0 text-primary" />
                        Live question {number}
                      </span>
                      <Check className="size-4 shrink-0 text-primary" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
