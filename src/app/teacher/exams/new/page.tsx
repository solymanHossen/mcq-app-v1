import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createExamAction } from "@/modules/exams/actions"
import { ExamForm } from "@/modules/exams/components/exam-form"
import { Badge } from "@/components/ui/badge"

export default function NewExamPage() {
  return (
    <div className="w-full space-y-6">
      {/* Clean Top Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/exams"
            className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Exams"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              New Exam
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
              Draft
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Utilitarian Form */}
      <ExamForm action={createExamAction} submitLabel="Create Exam" />
    </div>
  )
}
