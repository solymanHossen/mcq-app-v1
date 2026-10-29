import Link from "next/link"
import { ArrowLeft, Sparkles, BookOpenCheck } from "lucide-react"
import { createExamAction } from "@/modules/exams/actions"
import { ExamForm } from "@/modules/exams/components/exam-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Create New Exam",
  description: "Configure schedule, question randomization, anti-cheating, and scoring policies.",
}

export default function NewExamPage() {
  return (
    <div className="w-full space-y-8 pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/teacher/exams">
              <ArrowLeft className="mr-1.5 size-4" />
              <span>Back to exams</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Create New Assessment
            </h1>
            <Badge variant="secondary" className="rounded-lg text-xs font-semibold">
              Draft
            </Badge>
          </div>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Configure test schedule, passing criteria, integrity monitoring, and randomization policies.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge
            variant="outline"
            className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-primary/5 text-primary border-primary/20"
          >
            <Sparkles className="mr-1.5 size-3.5" />
            <span>Step 1: Exam Settings</span>
          </Badge>
        </div>
      </div>

      {/* Main Form */}
      <ExamForm
        action={createExamAction}
        submitLabel="Create Assessment & Add Questions"
        cancelHref="/teacher/exams"
      />
    </div>
  )
}
