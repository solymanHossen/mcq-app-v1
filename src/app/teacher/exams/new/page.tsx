import Link from "next/link"
import { ArrowLeft, Trash2 } from "lucide-react"
import { createExamAction } from "@/modules/exams/actions"
import { ExamForm } from "@/modules/exams/components/exam-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Create Assessment | MCQ Platform",
  description: "Configure schedule, question randomization, anti-cheating, and scoring policies.",
}

export default function NewExamPage() {
  return (
    <div className="w-full space-y-8 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-4">
        <div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8.5 px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs active:scale-95 group gap-2"
          >
            <Link href="/teacher/exams">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to exams</span>
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Create Assessment
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
            >
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Draft</span>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground"
            >
              Step 1
            </Badge>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 px-4 rounded-xl text-sm font-semibold border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all gap-2 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
          >
            <Link href="/teacher/exams">
              <Trash2 className="size-4 shrink-0" />
              <span>Discard Assessment</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Assessment Form */}
      <ExamForm
        action={createExamAction}
        submitLabel="Create Assessment"
        cancelHref="/teacher/exams"
      />
    </div>
  )
}
