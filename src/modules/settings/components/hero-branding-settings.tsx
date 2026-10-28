"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import {
  Film,
  Sparkles,
  Type,
  Upload,
  Check,
  Loader2,
  ExternalLink,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { updateHeroBrandingSettingsAction } from "@/modules/settings/actions"
import type { SystemSettings } from "@/modules/settings/queries"
import { APP_NAME } from "@/lib/config"

interface HeroBrandingSettingsProps {
  settings: SystemSettings
}

type TabKey = "media" | "logo" | "text"

export function HeroBrandingSettings({ settings }: HeroBrandingSettingsProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("media")

  const [logoUrl, setLogoUrl] = React.useState(settings.logoUrl ?? "")
  const [heroImageUrl, setHeroImageUrl] = React.useState(settings.heroImageUrl ?? "")
  const [heroVideoUrl, setHeroVideoUrl] = React.useState(settings.heroVideoUrl ?? "")
  const [heroTitle, setHeroTitle] = React.useState(settings.heroTitle ?? "")
  const [heroSubtitle, setHeroSubtitle] = React.useState(settings.heroSubtitle ?? "")

  const [isPending, startTransition] = React.useTransition()
  const [uploadingTarget, setUploadingTarget] = React.useState<string | null>(null)

  const DEFAULT_HERO_IMAGE = "/images/hero-students-v2.jpg"
  const DEFAULT_HERO_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"

  const effectiveHeroImage = heroImageUrl.trim() || DEFAULT_HERO_IMAGE
  const effectiveHeroVideo = heroVideoUrl.trim() || DEFAULT_HERO_VIDEO

  // Smart detect YouTube/Vimeo embed
  const getEmbedVideoUrl = (url: string) => {
    if (!url) return null
    try {
      if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v")
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0]
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
      }
      if (url.includes("vimeo.com/")) {
        const videoId = url.split("vimeo.com/")[1]?.split("?")[0]
        return videoId ? `https://player.vimeo.com/video/${videoId}` : null
      }
    } catch {
      return null
    }
    return null
  }

  const embedUrl = getEmbedVideoUrl(effectiveHeroVideo)

  // Direct file upload handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "logo" | "hero-image" | "hero-video"
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingTarget(target)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", target)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      if (target === "logo") {
        setLogoUrl(data.url)
        toast.success("Logo uploaded successfully")
      } else if (target === "hero-image") {
        setHeroImageUrl(data.url)
        toast.success("Hero image uploaded successfully")
      } else if (target === "hero-video") {
        setHeroVideoUrl(data.url)
        toast.success("Hero video uploaded successfully")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload error"
      toast.error(message)
    } finally {
      setUploadingTarget(null)
      e.target.value = ""
    }
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await updateHeroBrandingSettingsAction({
          logoUrl,
          heroImageUrl,
          heroVideoUrl,
          heroTitle,
          heroSubtitle,
        })
        if (res?.success) {
          toast.success("Settings saved successfully")
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update settings"
        toast.error(message)
      }
    })
  }

  const tabs: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
    { key: "media", label: "Hero Media", icon: Film },
    { key: "logo", label: "Platform Logo", icon: Sparkles },
    { key: "text", label: "Hero Copy", icon: Type },
  ]

  return (
    <div className="w-full space-y-6">
      {/* ================= LARGE SMOOTH TAB DOCK (PROFILE PAGE STYLE) ================= */}
      <nav
        role="tablist"
        aria-label="Branding sections"
        className="flex w-full min-w-fit items-center gap-2 rounded-2xl bg-muted/60 p-1.5 shadow-2xs backdrop-blur-xl sm:p-2 sm:gap-2.5"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "group relative flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 select-none sm:px-6 sm:py-3.5 sm:text-base",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-4.5 transition-transform duration-200 group-hover:scale-105 sm:size-5",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* ================= TAB 1: HERO MEDIA (IMAGE & VIDEO) ================= */}
      {activeTab === "media" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* HERO IMAGE CARD */}
          <div className="flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-border/80 transition-all sm:p-8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                  Hero Image
                </h3>
                {heroImageUrl && (
                  <button
                    type="button"
                    onClick={() => setHeroImageUrl("")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="Image URL or upload..."
                  className="h-12 rounded-xl text-sm sm:text-base px-4 bg-background"
                />
                <label className="inline-flex cursor-pointer shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(e, "hero-image")}
                    disabled={uploadingTarget === "hero-image"}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={uploadingTarget === "hero-image"}
                    className="h-12 rounded-xl px-4 sm:px-5 font-semibold gap-2 pointer-events-none"
                  >
                    {uploadingTarget === "hero-image" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    <span>Upload</span>
                  </Button>
                </label>
              </div>

              {/* CLEAN LARGE IMAGE PREVIEW */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/30 shadow-xs">
                <Image
                  src={effectiveHeroImage}
                  alt="Hero Image Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* HERO VIDEO CARD */}
          <div className="flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-border/80 transition-all sm:p-8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                  Hero Video
                </h3>
                {heroVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setHeroVideoUrl("")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="MP4 URL or YouTube / Vimeo link..."
                  className="h-12 rounded-xl text-sm sm:text-base px-4 bg-background"
                />
                <label className="inline-flex cursor-pointer shrink-0">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(e, "hero-video")}
                    disabled={uploadingTarget === "hero-video"}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={uploadingTarget === "hero-video"}
                    className="h-12 rounded-xl px-4 sm:px-5 font-semibold gap-2 pointer-events-none"
                  >
                    {uploadingTarget === "hero-video" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    <span>Upload</span>
                  </Button>
                </label>
              </div>

              {/* CLEAN LARGE VIDEO PREVIEW */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/80 bg-black shadow-xs">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title="Hero Video Preview"
                    className="size-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={effectiveHeroVideo}
                    controls
                    playsInline
                    preload="metadata"
                    src={effectiveHeroVideo}
                    className="size-full object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PLATFORM LOGO ================= */}
      {activeTab === "logo" && (
        <div className="rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-border/80 transition-all sm:p-8 max-w-4xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                Brand Logo
              </h3>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset to default</span>
                </button>
              )}
            </div>

            <div className="flex gap-2 max-w-2xl">
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Logo URL or upload SVG / PNG..."
                className="h-12 rounded-xl text-sm sm:text-base px-4 bg-background"
              />
              <label className="inline-flex cursor-pointer shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  disabled={uploadingTarget === "logo"}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={uploadingTarget === "logo"}
                  className="h-12 rounded-xl px-4 sm:px-5 font-semibold gap-2 pointer-events-none"
                >
                  {uploadingTarget === "logo" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  <span>Upload</span>
                </Button>
              </label>
            </div>

            {/* PREVIEW TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl pt-2">
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                {logoUrl ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-1 flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      width={48}
                      height={48}
                      className="size-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                    <Sparkles className="size-6" />
                  </span>
                )}
                <div>
                  <span className="font-heading text-lg font-bold text-slate-900 block">
                    {APP_NAME}
                  </span>
                  <span className="text-xs text-slate-500">Light theme preview</span>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xs">
                {logoUrl ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-1 flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt="Logo Dark"
                      width={48}
                      height={48}
                      className="size-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-xl bg-white text-slate-950 shadow-xs">
                    <Sparkles className="size-6" />
                  </span>
                )}
                <div>
                  <span className="font-heading text-lg font-bold text-white block">
                    {APP_NAME}
                  </span>
                  <span className="text-xs text-slate-400">Dark theme preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: HERO COPY ================= */}
      {activeTab === "text" && (
        <div className="rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-border/80 transition-all sm:p-8 max-w-3xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                Hero Headlines
              </h3>
              {(heroTitle || heroSubtitle) && (
                <button
                  type="button"
                  onClick={() => {
                    setHeroTitle("")
                    setHeroSubtitle("")
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset to default</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Headline</label>
                <Input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="The Elite Standard for Online Examinations"
                  className="h-12 rounded-xl text-sm sm:text-base px-4 bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Subtitle</label>
                <textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  rows={3}
                  placeholder="Empower your institution with a secure, intuitive, and frictionless testing platform built for the modern era."
                  className="w-full rounded-xl border border-input bg-background p-4 text-sm sm:text-base placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ULTRA-CLEAN MODERN GOOGLE-STYLE ACTION BAR ================= */}
      <div className="flex items-center justify-between rounded-2xl bg-card/70 px-5 py-3.5 ring-1 ring-border/80 shadow-xs backdrop-blur-md">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-11 rounded-xl text-sm font-medium gap-2 cursor-pointer hover:bg-muted/70"
        >
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <span>View Landing Page</span>
            <ExternalLink className="size-4 text-muted-foreground" />
          </Link>
        </Button>

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="h-11 sm:h-12 rounded-xl px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-md gap-2 cursor-pointer active:scale-[0.99] transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="size-4.5 stroke-[2.5]" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
