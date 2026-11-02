import type { Metadata } from "next"
import Link from "next/link"
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  FileText,
  UserCheck,
  ArrowLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description:
    "Review how ExamHub protects student assessment records, proctoring signals, faculty question banks, and institutional data.",
}

export const instant = false

const SECTIONS = [
  {
    icon: Database,
    title: "1. Information We Collect",
    badge: "Data Collection",
    content: [
      "Account Credentials: Name, email address, password hash, and assigned institutional role (Student, Teacher, Admin).",
      "Assessment Data: Answers submitted, test start/completion timestamps, total score, and item responses.",
      "Integrity & Proctoring Signals: Browser blur events, tab switches, and full-screen departure counts during active attempts.",
      "We strictly do NOT capture, record, or store any camera photos, videos, or audio streams.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "2. How We Use Assessment Data",
    badge: "Purpose",
    content: [
      "To automatically compute examination grades and render personalized mistake explanations.",
      "To provide faculty with aggregated difficulty diagnostics and question performance statistics.",
      "To generate fair classroom rankings and leaderboards in accordance with exam settings.",
      "To flag anomalous test sessions for human instructor review when anti-cheat thresholds are exceeded.",
    ],
  },
  {
    icon: Lock,
    title: "3. Data Security & Encryption",
    badge: "Security",
    content: [
      "All transmission of exam content and responses is encrypted via modern TLS 1.3 protocol.",
      "Answer keys remain securely encrypted on the server and are undisclosed until the instructor releases them.",
      "Role-based access control (RBAC) ensures students can never inspect unassigned questions or administrative records.",
    ],
  },
  {
    icon: UserCheck,
    title: "4. Student Rights & Control",
    badge: "Your Rights",
    content: [
      "Students may review their past graded exam attempts, explanations, and scores through their Candidate Dashboard.",
      "Students have the right to request clarification or appeal disputed question results directly through their instructor.",
      "Account deletion or institutional record unlinking may be requested through our Support Center.",
    ],
  },
]

export default function PrivacyPage() {
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
                Privacy Policy
              </h1>
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20"
              >
                Effective 2026
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
              At {APP_NAME}, we take academic privacy and data confidentiality seriously. This policy
              explains how your assessment records, account details, and proctoring telemetry are handled.
            </p>
          </div>
        </div>

        {/* Privacy Sections Cards */}
        <div className="space-y-6">
          {SECTIONS.map((section) => {
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

        {/* Footer Support Notice */}
        <Card className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Questions regarding our data handling practices?
            </h3>
            <p className="text-xs text-muted-foreground">
              Contact our academic privacy officer for institutional compliance inquiries.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl shrink-0 h-9.5 px-4 font-semibold">
            <Link href="/contact">Contact Privacy Team</Link>
          </Button>
        </Card>

      </div>
    </main>
  )
}
