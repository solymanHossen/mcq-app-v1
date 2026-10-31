import Link from "next/link"
import { redirect } from "next/navigation"
import { requireRole } from "@/lib/authorization"
import { getMistakeNotebook, getBookmarks } from "@/modules/learning/queries"
import { MistakeReviewCard } from "@/modules/learning/components/mistake-review-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { CheckCircle2, RotateCcw, TrendingUp } from "lucide-react"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function MistakeNotebookPage() {
  const user = await requireRole("STUDENT")
  if (user.isGuest) redirect("/exams")

  const [mistakes, bookmarks] = await Promise.all([
    getMistakeNotebook(user.id),
    getBookmarks(user.id),
  ])
  const bookmarkedIds = new Set(bookmarks.map((b) => b.examQuestionId))

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Mistake Notebook
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
          >
            <RotateCcw className="size-3 text-amber-500" />
            <span>Spaced Repetition</span>
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground"
          >
            {mistakes.length} review item{mistakes.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 sm:h-9.5 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs active:scale-95 transition-all gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Link href="/progress">
            <TrendingUp className="size-3.5" />
            <span>View Progress</span>
          </Link>
        </Button>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed -mt-2">
        Questions previously missed, scheduled with spaced repetition intervals — re-answer to reinforce memory retention and achieve complete subject mastery.
      </p>

      {mistakes.length === 0 ? (
        <Empty className="rounded-2xl border border-border/70 bg-card p-6 sm:p-10 shadow-xs">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 shadow-2xs">
              <CheckCircle2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle className="text-base sm:text-xl font-bold tracking-tight text-foreground mt-2">
              All Mistakes Cleared!
            </EmptyTitle>
            <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              You currently have no overdue mistake reviews. Keep taking practice assessments to identify focus topics and test your knowledge.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-6 sm:space-y-8 min-w-0">
          {mistakes.map((m) => (
            <MistakeReviewCard
              key={m.id}
              examQuestionId={m.examQuestion.id}
              questionText={m.examQuestion.questionTextSnapshot}
              options={{
                A: m.examQuestion.optionASnapshot,
                B: m.examQuestion.optionBSnapshot,
                C: m.examQuestion.optionCSnapshot,
                D: m.examQuestion.optionDSnapshot,
              }}
              examTitle={m.examQuestion.exam.title}
              answerKeyReleased={m.examQuestion.exam.answerKeyReleased}
              bookmarked={bookmarkedIds.has(m.examQuestion.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

