import type { Metadata } from "next"
import Link from "next/link"
import {
  FileText,
  ShieldAlert,
  GraduationCap,
  Scale,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description:
    "Review the terms of service, academic honesty rules, examination conduct policies, and faculty author rights on ExamHub.",
}

export const instant = false

const TERMS_SECTIONS = [
  {
    icon: GraduationCap,
    title: "1. Academic Integrity & Candidate Conduct",
    badge: "Honesty Policy",
    content: [
      "All assessments taken on this platform must reflect the candidate's sole, independent work unless group work is explicitly permitted by the instructor.",
      "Unauthorized use of external materials, secondary browser tabs, automated scripts, or artificial assistance during an active attempt constitutes an integrity breach.",
      "Integrity telemetry (tab-switches, focus loss) is recorded and reviewable by your exam administrator. Confirmed violations may lead to disqualification.",
    ],
  },
  {
    icon: BookOpen,
    title: "2. Faculty Rights & Question Bank Ownership",
    badge: "Content Rights",
    content: [
      "Instructors retain copyright over their authored questions, explanations, and custom examination materials.",
      "By creating public or institutional exams, instructors grant ExamHub a limited license to store, process, display, and auto-grade responses.",
      "Redistribution, reproduction, or unauthorized scraping of question banks without faculty permission is strictly prohibited.",
    ],
  },
  {
    icon: ShieldAlert,
    title: "3. Account Security & Responsibilities",
    badge: "Security",
    content: [
      "Users are solely responsible for maintaining the confidentiality of their credentials and one-time passwords (OTP).",
      "Sharing account access to take examinations on behalf of another individual is grounds for permanent platform suspension.",
      "Notify administrators immediately at our Contact portal if unauthorized access to your account is detected.",
    ],
  },
  {
    icon: Scale,
    title: "4. Grading, Disputes & Platform Availability",
    badge: "Service Rules",
    content: [
      "Automated scores are computed based on the answer key established by the examiner. Any grading dispute must be appealed directly to the exam author.",
      "ExamHub aims for 99.99% uptime. While our runner implements local fault tolerance for temporary connectivity dropouts, candidates must ensure stable internet access.",
    ],
  },
]

export default function TermsPage() {
  return (
    <main className="flex-1 pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8 sm:space-y-10">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8.5 px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs gap-1.5"
          >
            <Link href="/">
              <ArrowLeft className="size-3.5" />
              <span>Back to home</span>
            </Link>
          </Button>

          <div className="space-y-2 border-b border-border/60 pb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Terms of Service
              </h1>
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20"
              >
                Standard Academic Edition
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
              These terms govern your participation as a student, candidate, faculty member, or institution
              on the {APP_NAME} platform. Please read them carefully.
            </p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {TERMS_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <Card
                key={section.title}
                className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden"
              >
                <div className="px-5 sm:px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 sm:size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                      <Icon className="size-4.5 sm:size-5" />
                    </div>
                    <h2 className="font-heading text-base sm:text-lg font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-border/70 shrink-0">
                    {section.badge}
                  </Badge>
                </div>

                <div className="p-5 sm:p-6">
                  <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground font-medium">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Footer Inquiry Card */}
        <Card className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Need custom terms for your school or university?
            </h3>
            <p className="text-xs text-muted-foreground">
              We offer tailored enterprise agreements and academic integrity covenants.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl shrink-0 h-9.5 px-4 font-semibold">
            <Link href="/contact">Inquire with Legal</Link>
          </Button>
        </Card>

      </div>
    </main>
  )
}
