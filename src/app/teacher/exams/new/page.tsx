import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
