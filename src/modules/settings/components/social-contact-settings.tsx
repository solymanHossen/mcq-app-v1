"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Share2,
  Mail,
  Loader2,
  Check,
  RotateCcw,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AdminPageHeader } from "@/components/shared/admin-page-header"
import { updateSocialContactSettingsAction } from "@/modules/settings/actions"
import type { SystemSettings } from "@/modules/settings/queries"

// Social Icons matching Lucide geometry
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="GitHub">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

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

interface SocialContactSettingsProps {
  settings: SystemSettings
}

export function SocialContactSettings({ settings }: SocialContactSettingsProps) {
  const [githubUrl, setGithubUrl] = React.useState(settings.githubUrl ?? "")
  const [twitterUrl, setTwitterUrl] = React.useState(settings.twitterUrl ?? "")
  const [linkedinUrl, setLinkedinUrl] = React.useState(settings.linkedinUrl ?? "")
  const [facebookUrl, setFacebookUrl] = React.useState(settings.facebookUrl ?? "")
  const [youtubeUrl, setYoutubeUrl] = React.useState(settings.youtubeUrl ?? "")
  const [contactEmail, setContactEmail] = React.useState(settings.contactEmail ?? "")

  const [isPending, startTransition] = React.useTransition()

  const [lastSaved, setLastSaved] = React.useState({
    githubUrl: settings.githubUrl ?? "",
    twitterUrl: settings.twitterUrl ?? "",
    linkedinUrl: settings.linkedinUrl ?? "",
    facebookUrl: settings.facebookUrl ?? "",
    youtubeUrl: settings.youtubeUrl ?? "",
    contactEmail: settings.contactEmail ?? "",
  })

  React.useEffect(() => {
    setLastSaved({
      githubUrl: settings.githubUrl ?? "",
      twitterUrl: settings.twitterUrl ?? "",
      linkedinUrl: settings.linkedinUrl ?? "",
      facebookUrl: settings.facebookUrl ?? "",
      youtubeUrl: settings.youtubeUrl ?? "",
      contactEmail: settings.contactEmail ?? "",
    })
  }, [settings])

  const isDirty =
    githubUrl !== lastSaved.githubUrl ||
    twitterUrl !== lastSaved.twitterUrl ||
    linkedinUrl !== lastSaved.linkedinUrl ||
    facebookUrl !== lastSaved.facebookUrl ||
    youtubeUrl !== lastSaved.youtubeUrl ||
    contactEmail !== lastSaved.contactEmail

  const handleReset = () => {
    setGithubUrl(lastSaved.githubUrl)
    setTwitterUrl(lastSaved.twitterUrl)
    setLinkedinUrl(lastSaved.linkedinUrl)
    setFacebookUrl(lastSaved.facebookUrl)
    setYoutubeUrl(lastSaved.youtubeUrl)
    setContactEmail(lastSaved.contactEmail)
  }

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSocialContactSettingsAction({
        githubUrl,
        twitterUrl,
        linkedinUrl,
        facebookUrl,
        youtubeUrl,
        contactEmail,
      })

      if (res && "error" in res && res.error) {
        toast.error(res.error)
      } else {
        setLastSaved({
          githubUrl,
          twitterUrl,
          linkedinUrl,
          facebookUrl,
          youtubeUrl,
          contactEmail,
        })
        toast.success("Social and contact settings saved successfully")
      }
    })
  }

  return (
    <div className="w-full min-w-0 space-y-8 sm:space-y-10 pb-16">
      <AdminPageHeader
        title="Social & Contact Settings"
        description="Configure dynamic social media channels, support email, and institutional contact links displayed in the application footer and contact page."
        actions={
          <div className="flex items-center gap-2">
            {isDirty && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isPending}
                className="h-10 px-3.5 gap-2 rounded-xl text-xs sm:text-sm font-semibold border-border/70 hover:bg-muted cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || !isDirty}
              className="h-10 px-5 gap-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Group 1: Social Media Profiles */}
      <div className="space-y-3.5">
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
          <div className="px-5 sm:px-6 py-4 sm:py-4.5 border-b border-border/60 bg-muted/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Share2 className="size-4.5 sm:size-5" />
              </div>
              <div>
                <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
                  Social Channels
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Links will automatically render in the platform footer and public pages
                </p>
              </div>
            </div>
            {isDirty && (
              <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* GitHub */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <Label
                htmlFor="githubUrl"
                className="md:col-span-3 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground shrink-0">
                  <GithubIcon className="size-3.5" />
                </span>
                <span>GitHub URL</span>
              </Label>
              <div className="md:col-span-9">
                <Input
                  id="githubUrl"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-organization"
                  className="h-11 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            {/* Twitter / X */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <Label
                htmlFor="twitterUrl"
                className="md:col-span-3 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground shrink-0">
                  <TwitterXIcon className="size-3.5" />
                </span>
                <span>X (Twitter) URL</span>
              </Label>
              <div className="md:col-span-9">
                <Input
                  id="twitterUrl"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/your-handle"
                  className="h-11 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <Label
                htmlFor="linkedinUrl"
                className="md:col-span-3 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <LinkedInIcon className="size-3.5" />
                </span>
                <span>LinkedIn URL</span>
              </Label>
              <div className="md:col-span-9">
                <Input
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/your-organization"
                  className="h-11 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <Label
                htmlFor="facebookUrl"
                className="md:col-span-3 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 shrink-0">
                  <FacebookIcon className="size-3.5" />
                </span>
                <span>Facebook URL</span>
              </Label>
              <div className="md:col-span-9">
                <Input
                  id="facebookUrl"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/your-page"
                  className="h-11 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            {/* YouTube */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <Label
                htmlFor="youtubeUrl"
                className="md:col-span-3 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 shrink-0">
                  <YouTubeIcon className="size-3.5" />
                </span>
                <span>YouTube URL</span>
              </Label>
              <div className="md:col-span-9">
                <Input
                  id="youtubeUrl"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@your-channel"
                  className="h-11 rounded-xl text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Group 2: Support & Contact Details */}
      <div className="space-y-3.5">
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
          <div className="px-5 sm:px-6 py-4 sm:py-4.5 border-b border-border/60 bg-muted/20 flex items-center gap-3">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <Mail className="size-4.5 sm:size-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm sm:text-base font-bold text-foreground">
                Institutional Contact & Support
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official contact email displayed to students, faculty, and public visitors
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <Label
                htmlFor="contactEmail"
                className="md:col-span-3 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <Mail className="size-4 text-muted-foreground" />
                <span>Support Email</span>
              </Label>
              <div className="md:col-span-9">
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="support@examhub.edu or contact@yourdomain.com"
                  className="h-11 rounded-xl text-sm font-medium"
                />
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                  <Info className="size-3.5 shrink-0" />
                  <span>
                    Used as the recipient in the public /contact page and support disclosures.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Preview Section */}
      <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-2xs space-y-3">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Live Footer Social Icons Preview
        </h3>
        <div className="flex items-center gap-2 pt-1">
          {githubUrl.trim() && (
            <a
              href={githubUrl.trim()}
              target="_blank"
              rel="noreferrer"
              className="flex size-9.5 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-2xs hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
              title="GitHub"
            >
              <GithubIcon className="size-4" />
            </a>
          )}
          {twitterUrl.trim() && (
            <a
              href={twitterUrl.trim()}
              target="_blank"
              rel="noreferrer"
              className="flex size-9.5 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-2xs hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
              title="Twitter"
            >
              <TwitterXIcon className="size-4" />
            </a>
          )}
          {linkedinUrl.trim() && (
            <a
              href={linkedinUrl.trim()}
              target="_blank"
              rel="noreferrer"
              className="flex size-9.5 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-2xs hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
              title="LinkedIn"
            >
              <LinkedInIcon className="size-4" />
            </a>
          )}
          {facebookUrl.trim() && (
            <a
              href={facebookUrl.trim()}
              target="_blank"
              rel="noreferrer"
              className="flex size-9.5 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-2xs hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
              title="Facebook"
            >
              <FacebookIcon className="size-4" />
            </a>
          )}
          {youtubeUrl.trim() && (
            <a
              href={youtubeUrl.trim()}
              target="_blank"
              rel="noreferrer"
              className="flex size-9.5 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-2xs hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
              title="YouTube"
            >
              <YouTubeIcon className="size-4" />
            </a>
          )}
          {!githubUrl.trim() &&
            !twitterUrl.trim() &&
            !linkedinUrl.trim() &&
            !facebookUrl.trim() &&
            !youtubeUrl.trim() && (
              <span className="text-xs text-muted-foreground italic">
                No social links configured yet. Default channels will be shown.
              </span>
            )}
        </div>
      </Card>
    </div>
  )
}
