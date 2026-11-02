"use client"

import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { toast } from "sonner"
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  ExternalLink,
  MessageCircle,
  Send,
  Mail,
  Lock,
  Globe,
  MessageSquare,
  Clock,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface ShareExamModalProps {
  exam: {
    id: string
    title: string
    description?: string | null
    durationMinutes: number
    status: string
    allowGuestAccess?: boolean
    accessCode?: string | null
    startTime?: Date | string | null
    endTime?: Date | string | null
  }
  trigger?: React.ReactNode
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ShareExamModal({
  exam,
  trigger,
  defaultOpen = false,
  onOpenChange,
}: ShareExamModalProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedMsg, setCopiedMsg] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const examUrl = `${origin}/exam/${exam.id}`

  // Generate QR Code data URL whenever modal opens
  useEffect(() => {
    if (open && examUrl) {
      QRCode.toDataURL(examUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Code generation error:", err))
    }
  }, [open, examUrl])

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(examUrl)
      setCopiedLink(true)
      toast.success("Exam link copied to clipboard!")
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      toast.error("Could not copy link")
    }
  }

  const inviteMessage = `📝 Exam Invitation: ${exam.title}
⏱️ Duration: ${exam.durationMinutes} minutes
🔗 Link: ${examUrl}
${exam.accessCode ? `🔑 Access PIN: ${exam.accessCode}\n` : ""}
⚡ Participation: ${
    exam.allowGuestAccess !== false
      ? "No registration needed! Just enter your Name & Email to begin."
      : "Login with your student account to participate."
  }`

  async function handleCopyInviteMessage() {
    try {
      await navigator.clipboard.writeText(inviteMessage)
      setCopiedMsg(true)
      toast.success("Full invite message copied!")
      setTimeout(() => setCopiedMsg(false), 2500)
    } catch {
      toast.error("Could not copy invite message")
    }
  }

  function handleDownloadQr() {
    if (!qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = `Exam-${exam.title.replace(/\s+/g, "-")}-QR.png`
    a.click()
    toast.success("QR Code downloaded")
  }

  const encodedUrl = encodeURIComponent(examUrl)
  const encodedMsg = encodeURIComponent(inviteMessage)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8.5 rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 text-xs font-semibold gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Share2 className="size-3.5" />
            <span>Share</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="w-[calc(100vw-1.25rem)] sm:w-full sm:max-w-lg max-h-[88dvh] sm:max-h-[85dvh] flex flex-col p-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-background border border-border/80 shadow-2xl gap-0">
        {/* Header Bar */}
        <DialogHeader className="px-4 py-3.5 sm:px-6 sm:py-4.5 bg-muted/20 border-b border-border/50 text-left shrink-0">
          <div className="flex items-center justify-between pr-8 sm:pr-9">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="size-9 sm:size-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                <Share2 className="size-4.5 sm:size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
                  Share Assessment
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  Distribute this exam to students via link, QR code, or chat
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant={exam.status === "PUBLISHED" ? "default" : "secondary"}
              className={cn(
                "text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 border",
                exam.status === "PUBLISHED"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              )}
            >
              {exam.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto min-h-0 flex-1 overscroll-contain">
          {/* Exam Summary Card */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border/70 bg-muted/25 space-y-2.5 shadow-2xs">
            <h4 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 leading-snug">
              {exam.title}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
              <Badge
                variant="outline"
                className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-lg border-border/70 bg-card text-foreground gap-1.5 shadow-2xs"
              >
                <Clock className="size-3 text-muted-foreground shrink-0" />
                <span>{exam.durationMinutes} mins</span>
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-2xs",
                  exam.allowGuestAccess !== false
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                )}
              >
                <Globe className="size-3 shrink-0" />
                <span>
                  {exam.allowGuestAccess !== false
                    ? "Direct Link (Open)"
                    : "Registered Students Only"}
                </span>
              </Badge>
              {exam.accessCode && (
                <Badge
                  variant="outline"
                  className="text-[11px] sm:text-xs font-mono font-bold px-2 sm:px-2.5 py-0.5 rounded-lg border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center gap-1.5 shadow-2xs max-w-full"
                >
                  <Lock className="size-3 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-[260px]">
                    PIN: {exam.accessCode}
                  </span>
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Copy Link Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-foreground">
                Exam Link
              </label>
              <span className="text-xs text-muted-foreground font-normal">
                Share this with students
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={examUrl}
                className="h-10 sm:h-11 text-xs sm:text-sm font-mono bg-muted/40 hover:bg-muted/60 transition-colors rounded-xl px-3 sm:px-3.5 border-border/70 focus-visible:ring-1 focus-visible:ring-primary shadow-2xs truncate"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {copiedLink ? (
                  <>
                    <Check className="size-4 mr-1.5 text-emerald-300 shrink-0" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-1.5 shrink-0" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs for Sharing Channels & QR Code */}
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-10 sm:h-10.5 rounded-xl bg-muted/60 p-1 border border-border/60">
              <TabsTrigger
                value="social"
                className="text-xs sm:text-sm font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer"
              >
                1-Click Share
              </TabsTrigger>
              <TabsTrigger
                value="qrcode"
                className="text-xs sm:text-sm font-bold rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all cursor-pointer"
              >
                QR Code &amp; Poster
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: 1-Click Share Channels */}
            <TabsContent value="social" className="space-y-3.5 pt-3 outline-none">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodedMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-border/70 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group cursor-pointer shadow-2xs active:scale-95"
                >
                  <div className="size-8.5 sm:size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-1 sm:mb-1.5 ring-1 ring-emerald-500/20">
                    <MessageCircle className="size-4.5 sm:size-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-foreground">
                    WhatsApp
                  </span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-border/70 bg-card hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group cursor-pointer shadow-2xs active:scale-95"
                >
                  <div className="size-8.5 sm:size-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-1 sm:mb-1.5 ring-1 ring-sky-500/20">
                    <Send className="size-4.5 sm:size-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-foreground">
                    Telegram
                  </span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    `Exam Invitation: ${exam.title}`
                  )}&body=${encodedMsg}`}
                  className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer shadow-2xs active:scale-95"
                >
                  <div className="size-8.5 sm:size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform mb-1 sm:mb-1.5 ring-1 ring-primary/20">
                    <Mail className="size-4.5 sm:size-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-foreground">
                    Email
                  </span>
                </a>
              </div>

              {/* Ready-to-paste Classroom Invite Text */}
              <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-muted/20 p-3 sm:p-3.5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="size-4 text-primary shrink-0" />
                    <span>Formatted Invite Message</span>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyInviteMessage}
                    className="h-7 px-2.5 text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer rounded-lg border-border/70 gap-1 active:scale-95 transition-all shadow-2xs"
                  >
                    {copiedMsg ? (
                      <>
                        <Check className="size-3.5 mr-1 text-emerald-500 shrink-0" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 mr-1 shrink-0" />
                        <span>Copy text</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-mono bg-card p-2.5 sm:p-3 rounded-xl whitespace-pre-line border border-border/60 line-clamp-4 leading-relaxed select-all">
                  {inviteMessage}
                </p>
              </div>
            </TabsContent>

            {/* Tab 2: QR Code View */}
            <TabsContent value="qrcode" className="pt-3 flex flex-col items-center space-y-3.5 outline-none">
              <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-border/70 shadow-sm ring-1 ring-border/20">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${exam.title}`}
                    className="size-40 sm:size-48 rounded-xl object-contain"
                  />
                ) : (
                  <div className="size-40 sm:size-48 flex items-center justify-center text-muted-foreground">
                    <QrCode className="size-8 animate-pulse text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-center text-muted-foreground max-w-xs leading-relaxed">
                Students can scan this code with their smartphone camera to instantly enter the exam.
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQr}
                  className="rounded-xl text-xs sm:text-sm font-bold h-9.5 sm:h-10 px-3.5 sm:px-4 gap-1.5 cursor-pointer shadow-2xs border-border/70 hover:bg-muted active:scale-95 transition-all"
                >
                  <Download className="size-4" />
                  <span>Download Image</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  asChild
                  className="rounded-xl text-xs sm:text-sm font-bold h-9.5 sm:h-10 px-3.5 sm:px-4 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs active:scale-95 transition-all"
                >
                  <a href={examUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                    <span>Open as Student</span>
                  </a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
