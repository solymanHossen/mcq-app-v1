import Link from "next/link"
import { ArrowLeft, Sparkles, PlusCircle } from "lucide-react"
import { createExamAction } from "@/modules/exams/actions"
import { ExamForm } from "@/modules/exams/components/exam-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Create New Assessment | MCQ Platform",
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
            variant="ghost"
            size="sm"
            className="group -ml-2 h-9 px-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Link href="/teacher/exams" className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg border border-border/70 bg-card group-hover:bg-muted transition-colors shadow-2xs">
                <ArrowLeft className="size-3.5" />
              </div>
              <span>Back to exams</span>
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Create New Assessment
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
                Step 1 of 2: Configure & Setup
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
              Configure exam policies, timing limits, proctoring security, and student link access rules. You will attach or generate questions right in the next step.
            </p>
          </div>
        </div>
      </div>

      {/* Main Assessment Form */}
      <ExamForm
        action={createExamAction}
        submitLabel="Create Assessment & Add Questions"
        cancelHref="/teacher/exams"
      />
    </div>
  )
}
