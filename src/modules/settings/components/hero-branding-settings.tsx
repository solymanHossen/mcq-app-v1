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

  const [lastSaved, setLastSaved] = React.useState({
    logoUrl: settings.logoUrl ?? "",
    heroImageUrl: settings.heroImageUrl ?? "",
    heroVideoUrl: settings.heroVideoUrl ?? "",
    heroTitle: settings.heroTitle ?? "",
    heroSubtitle: settings.heroSubtitle ?? "",
  })

  React.useEffect(() => {
    setLastSaved({
      logoUrl: settings.logoUrl ?? "",
      heroImageUrl: settings.heroImageUrl ?? "",
      heroVideoUrl: settings.heroVideoUrl ?? "",
      heroTitle: settings.heroTitle ?? "",
      heroSubtitle: settings.heroSubtitle ?? "",
    })
  }, [settings])

  const isDirty =
    logoUrl !== lastSaved.logoUrl ||
    heroImageUrl !== lastSaved.heroImageUrl ||
    heroVideoUrl !== lastSaved.heroVideoUrl ||
    heroTitle !== lastSaved.heroTitle ||
    heroSubtitle !== lastSaved.heroSubtitle

  const DEFAULT_HERO_IMAGE = "/images/hero-students-v2.jpg"
  const DEFAULT_HERO_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"

  const effectiveHeroImage = heroImageUrl.trim() || DEFAULT_HERO_IMAGE
  const effectiveHeroVideo = heroVideoUrl.trim() || DEFAULT_HERO_VIDEO

  // Smart detect YouTube / Vimeo embed
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
    if (!isDirty) return

    startTransition(async () => {
      try {
        const res = await updateHeroBrandingSettingsAction({
          logoUrl,
          heroImageUrl,
          heroVideoUrl,
          heroTitle,
          heroSubtitle,
        })
        if ("error" in res && res.error) {
          toast.error(res.error)
          return
        }
        if (res?.success) {
          setLastSaved({
            logoUrl,
            heroImageUrl,
            heroVideoUrl,
            heroTitle,
            heroSubtitle,
          })
          toast.success("Settings saved successfully!", {
            description: "Platform branding, hero video, and media are now live across the platform.",
            duration: 4000,
          })
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
    { key: "text", label: "Hero", icon: Type },
  ]

  const heroTitleWords = React.useMemo(() => {
    const text = heroTitle.trim()
    if (!text) return []
    const words = text.split(/\s+/)
    return words.map((w) => {
      const isHighlighted = w.startsWith("{") && w.endsWith("}")
      const cleanWord = w.replace(/[{}]/g, "")
      return {
        rawWord: w,
        cleanWord,
        isHighlighted,
      }
    })
  }, [heroTitle])

  const toggleWordHighlight = (targetRawWord: string) => {
    if (targetRawWord.startsWith("{") && targetRawWord.endsWith("}")) {
      const unwrapped = targetRawWord.slice(1, -1)
      setHeroTitle((prev) => prev.replace(targetRawWord, unwrapped))
    } else {
      const clean = targetRawWord.replace(/[{}]/g, "")
      const escaped = targetRawWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(`(?<=^|\\s)${escaped}(?=\\s|$)`, "g")
      setHeroTitle((prev) => prev.replace(regex, `{${clean}}`))
    }
  }

  const renderPreviewTitle = (title: string) => {
    if (!title.trim()) {
      return (
        <>
          The Elite Standard for <span className="text-primary font-extrabold">Online</span>{" "}
          <span className="text-primary font-extrabold">Examinations</span>
        </>
      )
    }

    const regex = /\{([^}]+)\}|\[([^\]]+)\]|\*([^*]+)\*/g
    const hasMarkup = regex.test(title)

    if (hasMarkup) {
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null
      regex.lastIndex = 0

      while ((match = regex.exec(title)) !== null) {
        if (match.index > lastIndex) {
          parts.push(title.slice(lastIndex, match.index))
        }
        const highlighted = match[1] || match[2] || match[3]
        parts.push(
          <span key={match.index} className="text-primary font-extrabold">
            {highlighted}
          </span>
        )
        lastIndex = regex.lastIndex
      }

      if (lastIndex < title.length) {
        parts.push(title.slice(lastIndex))
      }

      return parts
    }

    if (/online|examinations/i.test(title)) {
      const parts = title.split(/(online|examinations)/i)
      return parts.map((part, idx) => {
        if (/^(online|examinations)$/i.test(part)) {
          return (
            <span key={idx} className="text-primary font-extrabold">
              {part}
            </span>
          )
        }
        return part
      })
    }

    return title
  }

  return (
    <div className="w-full space-y-6">
      {/* ================= HEADER: TITLE ON LEFT, ACTIONS ON RIGHT (NO SUB-DESCRIPTION) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-1">
        <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Platform Settings
        </h1>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-lg gap-2 text-xs sm:text-sm font-medium border-border/80 hover:bg-muted/70 cursor-pointer"
          >
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5 text-muted-foreground" />
              <span>View Live Site</span>
            </Link>
          </Button>

          <Button
            onClick={handleSave}
            disabled={!isDirty || isPending}
            size="sm"
            className={cn(
              "h-9 rounded-lg px-4 text-xs sm:text-sm font-semibold gap-2 transition-all duration-200",
              isDirty
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer active:scale-[0.98]"
                : "bg-muted text-muted-foreground/60 opacity-60 cursor-not-allowed border border-border/50 shadow-none pointer-events-none"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="size-3.5 stroke-[2.5]" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ================= SMOOTH SEGMENTED TABS WITH COMFORTABLE PADDING & GAP ================= */}
      <div className="w-full">
        <nav
          role="tablist"
          aria-label="Settings sections"
          className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-muted/60 p-1.5 border border-border/60 shadow-2xs backdrop-blur-xl"
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
                  "inline-flex h-9 sm:h-9.5 items-center justify-center gap-2 rounded-lg px-4 text-xs sm:text-sm font-medium transition-all duration-150 select-none cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-150",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* ================= TAB 1: HERO MEDIA (IMAGE & VIDEO) ================= */}
      {activeTab === "media" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* HERO IMAGE CARD */}
          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">
                  Hero Banner Image
                </span>
                {heroImageUrl && (
                  <button
                    type="button"
                    onClick={() => setHeroImageUrl("")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* INTEGRATED INPUT + UPLOAD PILL */}
              <div className="relative flex items-center">
                <Input
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="Paste image URL or choose file..."
                  className="h-10 rounded-lg pr-24 pl-3.5 text-xs sm:text-sm bg-background border-border/80 shadow-2xs focus-visible:ring-1 focus-visible:ring-primary"
                />
                <label className="absolute right-1.5 inline-flex cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(e, "hero-image")}
                    disabled={uploadingTarget === "hero-image"}
                  />
                  <span
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-md bg-secondary hover:bg-secondary/80 px-2.5 text-xs font-semibold text-secondary-foreground transition-colors shadow-2xs select-none",
                      uploadingTarget === "hero-image" && "opacity-70 pointer-events-none"
                    )}
                  >
                    {uploadingTarget === "hero-image" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>Upload</span>
                  </span>
                </label>
              </div>

              {/* CLEAN 16:9 PREVIEW */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/70 bg-muted/30 shadow-xs">
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

          {/* WORLD-CLASS HERO VIDEO SHOWCASE CARD */}
          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    Landing Page Video
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Preview
                  </span>
                </div>
                {heroVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setHeroVideoUrl("")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* INTEGRATED INPUT + UPLOAD PILL */}
              <div className="relative flex items-center">
                <Input
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="MP4 URL or YouTube / Vimeo link..."
                  className="h-10 rounded-lg pr-24 pl-3.5 text-xs sm:text-sm bg-background border-border/80 shadow-2xs focus-visible:ring-1 focus-visible:ring-primary"
                />
                <label className="absolute right-1.5 inline-flex cursor-pointer">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="sr-only"
                    onChange={(e) => handleFileUpload(e, "hero-video")}
                    disabled={uploadingTarget === "hero-video"}
                  />
                  <span
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-md bg-secondary hover:bg-secondary/80 px-2.5 text-xs font-semibold text-secondary-foreground transition-colors shadow-2xs select-none",
                      uploadingTarget === "hero-video" && "opacity-70 pointer-events-none"
                    )}
                  >
                    {uploadingTarget === "hero-video" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>Upload</span>
                  </span>
                </label>
              </div>

              {/* WORLD-CLASS 16:9 CINEMA VIDEO PLAYER */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/80 bg-slate-950 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
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
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs max-w-4xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                Brand Logo
              </span>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* INTEGRATED INPUT + UPLOAD PILL */}
            <div className="relative flex items-center max-w-2xl">
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Logo URL or upload SVG / PNG..."
                className="h-10 rounded-lg pr-24 pl-3.5 text-xs sm:text-sm bg-background border-border/80 shadow-2xs focus-visible:ring-1 focus-visible:ring-primary"
              />
              <label className="absolute right-1.5 inline-flex cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  disabled={uploadingTarget === "logo"}
                />
                <span
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-md bg-secondary hover:bg-secondary/80 px-2.5 text-xs font-semibold text-secondary-foreground transition-colors shadow-2xs select-none",
                    uploadingTarget === "logo" && "opacity-70 pointer-events-none"
                  )}
                >
                  {uploadingTarget === "logo" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  <span>Upload</span>
                </span>
              </label>
            </div>

            {/* PREVIEW TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl pt-2">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                {logoUrl ? (
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-1 flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      width={44}
                      height={44}
                      className="size-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                    <Sparkles className="size-5" />
                  </span>
                )}
                <div>
                  <span className="font-heading text-base font-bold text-slate-900 block">
                    {APP_NAME}
                  </span>
                  <span className="text-xs text-slate-500">Light theme</span>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xs">
                {logoUrl ? (
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-1 flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt="Logo Dark"
                      width={44}
                      height={44}
                      className="size-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="flex size-11 items-center justify-center rounded-xl bg-white text-slate-950 shadow-xs">
                    <Sparkles className="size-5" />
                  </span>
                )}
                <div>
                  <span className="font-heading text-base font-bold text-white block">
                    {APP_NAME}
                  </span>
                  <span className="text-xs text-slate-400">Dark theme</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: HERO (HEADLINES & SUBTITLE) ================= */}
      {activeTab === "text" && (
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs max-w-3xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                Hero Headlines
              </span>
              {(heroTitle || heroSubtitle) && (
                <button
                  type="button"
                  onClick={() => {
                    setHeroTitle("")
                    setHeroSubtitle("")
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset to default</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Headline</label>
                  <span className="text-[11px] text-muted-foreground">
                    Wrap with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-primary">{"{words}"}</code> for brand accent color
                  </span>
                </div>
                <Input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="The Elite Standard for {Online} {Examinations}"
                  className="h-10 rounded-lg text-xs sm:text-sm px-3.5 bg-background border-border/80 shadow-2xs"
                />

                {/* Quick Word Highlighter Chips */}
                {heroTitleWords.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Click any word to toggle brand accent color:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {heroTitleWords.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleWordHighlight(item.rawWord)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer select-none",
                            item.isHighlighted
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <span>{item.cleanWord}</span>
                          {item.isHighlighted && <Check className="size-3 stroke-[2.5]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Preview of Headline */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3.5 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block mb-1">
                    Live Headline Preview
                  </span>
                  <div className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                    {renderPreviewTitle(heroTitle)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-foreground">Subtitle</label>
                <textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  rows={3}
                  placeholder="Empower your institution with a secure, intuitive, and frictionless testing platform built for the modern era."
                  className="w-full rounded-lg border border-border/80 bg-background p-3 text-xs sm:text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
