import Link from "next/link"
import { ArrowLeft, Sparkles, ClipboardList } from "lucide-react"
import { createExamAction } from "@/modules/exams/actions"
import { ExamForm } from "@/modules/exams/components/exam-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function NewExamPage() {
  return (
    <div className="w-full space-y-8">
      {/* Top Breadcrumb & Executive Title Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/teacher/exams"
            className="hover:text-foreground transition-colors flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="size-4" />
            <span>Exams</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">New Assessment</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Create New Assessment
              </h1>
              <Badge variant="secondary" className="font-bold text-xs px-2.5 py-0.5">
                Draft
              </Badge>
            </div>
            <p className="mt-1.5 text-base sm:text-lg text-muted-foreground">
              Configure parameters, time limits, candidate anti-cheat security, and schedule availability.
            </p>
          </div>
        </div>
      </div>

      {/* Main Full-Width Form Studio */}
      <ExamForm action={createExamAction} submitLabel="Create Exam & Continue" />
    </div>
  )
}
