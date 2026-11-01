"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Mail,
  Send,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ContactClientProps {
  contactEmail: string
}

export function ContactClient({ contactEmail }: ContactClientProps) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSent, setIsSent] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSent(true)
      toast.success("Your message has been dispatched to our support team.")
    }, 700)
  }

  return (
    <div className="w-full space-y-8 sm:space-y-10">
      {/* ================= PAGE HERO CARD ================= */}
      <Card className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-20 size-80 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <MessageSquare className="size-3.5" />
            <span>Support &amp; Inquiries</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Contact ExamHub Team
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Have questions about institutional licensing, faculty verification, or technical support?
            Our academic response team is here to assist you.
          </p>
        </div>
      </Card>

      {/* ================= 2-COLUMN LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (8 Cols) */}
        <div className="lg:col-span-7">
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                  <Mail className="size-4.5" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-foreground">
                    Send an Inquiry
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We typically respond within 24 business hours
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-border/70">
                Direct Ticket
              </Badge>
            </div>

            <div className="p-5 sm:p-6">
              {isSent ? (
                <div className="py-8 text-center space-y-3">
                  <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-2xs">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Message Dispatched Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Thank you, {name}. A member of our support team will reply to {email} shortly.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSent(false)
                      setName("")
                      setEmail("")
                      setSubject("")
                      setMessage("")
                    }}
                    className="mt-4 rounded-xl text-xs font-semibold"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-name" className="text-xs sm:text-sm font-semibold text-foreground">
                        Your Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contact-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Jane Doe"
                        className="h-11 rounded-xl text-sm font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-email" className="text-xs sm:text-sm font-semibold text-foreground">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@institution.edu"
                        className="h-11 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-subject" className="text-xs sm:text-sm font-semibold text-foreground">
                      Subject
                    </Label>
                    <Input
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Question about exam scheduling or teacher accreditation"
                      className="h-11 rounded-xl text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-message" className="text-xs sm:text-sm font-semibold text-foreground">
                      Message Details <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe how we can assist you..."
                      className="rounded-xl text-sm font-medium resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 transition-all active:scale-98 gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="size-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Contact Details & Office Hours (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                <Mail className="size-4.5" />
              </div>
              <div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
                  Direct Email
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reach out directly anytime
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-xs sm:text-sm font-semibold text-primary break-all">
              {contactEmail}
            </div>
          </Card>

          <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-emerald-500/20">
                <Clock className="size-4.5" />
              </div>
              <div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
                  Operating Hours
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Academic support schedule
                </p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span>Monday &ndash; Friday</span>
                <span className="font-semibold text-foreground">08:00 &ndash; 18:00 UTC</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="font-semibold text-foreground">10:00 &ndash; 16:00 UTC</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-muted-foreground">Emergency Gating Only</span>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              <span>Academic Integrity Assurance</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Are you reporting a security issue or unauthorized exam distribution? Inquiries
              flagged for academic violations receive accelerated triage within 2 hours.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
