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

      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] p-0 rounded-2xl overflow-hidden bg-card border-border/80 shadow-2xl">
        <DialogHeader className="p-5 pb-3 bg-muted/20 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs">
                <Share2 className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Share Exam
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Distribute this exam to students via link, QR code, or chat
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant={exam.status === "PUBLISHED" ? "default" : "secondary"}
              className="text-xs font-semibold"
            >
              {exam.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Exam Summary Pill */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-muted/30 space-y-1.5">
            <h4 className="font-bold text-sm text-foreground line-clamp-1">
              {exam.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {exam.durationMinutes} mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Globe className="size-3" />
                {exam.allowGuestAccess !== false
                  ? "Direct Link (No Registration Needed)"
                  : "Registered Students Only"}
              </span>
              {exam.accessCode && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <Lock className="size-3" />
                    PIN: {exam.accessCode}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Copy Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Exam Link</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Share this with students
              </span>
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={examUrl}
                className="h-10 text-xs sm:text-sm font-mono bg-muted/40 rounded-xl select-all"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                className="h-10 px-3.5 rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="size-3.5 mr-1 text-emerald-300" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs for Sharing Channels & QR Code */}
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-9 rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="social"
                className="text-xs font-bold rounded-lg data-[state=active]:shadow-2xs"
              >
                1-Click Share
              </TabsTrigger>
              <TabsTrigger
                value="qrcode"
                className="text-xs font-bold rounded-lg data-[state=active]:shadow-2xs"
              >
                QR Code & Poster
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: 1-Click Share Channels */}
            <TabsContent value="social" className="space-y-3 pt-3">
              <div className="grid grid-cols-3 gap-2">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodedMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/70 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group cursor-pointer shadow-2xs"
                >
                  <MessageCircle className="size-5 text-emerald-500 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-semibold text-foreground">
                    WhatsApp
                  </span>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/70 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group cursor-pointer shadow-2xs"
                >
                  <Send className="size-5 text-sky-500 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-semibold text-foreground">
                    Telegram
                  </span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    `Exam Invitation: ${exam.title}`
                  )}&body=${encodedMsg}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border/70 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group cursor-pointer shadow-2xs"
                >
                  <Mail className="size-5 text-indigo-500 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-semibold text-foreground">
                    Email
                  </span>
                </a>
              </div>

              {/* Ready-to-paste Classroom Invite Text */}
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-primary" />
                    <span>Formatted Invite Message</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleCopyInviteMessage}
                    className="h-6.5 px-2 text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer rounded-lg"
                  >
                    {copiedMsg ? (
                      <>
                        <Check className="size-3 mr-1 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3 mr-1" />
                        Copy text
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground font-mono bg-background/80 p-2 rounded-lg whitespace-pre-line border border-border/50 line-clamp-4">
                  {inviteMessage}
                </p>
              </div>
            </TabsContent>

            {/* Tab 2: QR Code View */}
            <TabsContent value="qrcode" className="pt-3 flex flex-col items-center space-y-3">
              <div className="p-3 bg-white rounded-2xl border-2 border-border/70 shadow-md">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${exam.title}`}
                    className="size-48 rounded-xl object-contain"
                  />
                ) : (
                  <div className="size-48 flex items-center justify-center text-muted-foreground">
                    <QrCode className="size-8 animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground max-w-xs">
                Students can scan this code with their smartphone camera to instantly enter the exam.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQr}
                  className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="size-3.5" />
                  Download Image
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  asChild
                  className="rounded-xl text-xs font-bold gap-1.5"
                >
                  <a href={examUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    Open as Student
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
