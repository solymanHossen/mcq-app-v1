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
import {
  CheckCircle2,
  RotateCcw,
  TrendingUp,
  Zap,
  BookOpen,
  ArrowRight,
} from "lucide-react"

export const instant = false

export const metadata = {
  title: "Mistake Notebook | MCQ Platform",
  description: "Review and re-answer questions you missed using spaced repetition.",
}

export default async function MistakeNotebookPage() {
  const user = await requireRole("STUDENT")
  if (user.isGuest) redirect("/exams")

  const [mistakes, bookmarks] = await Promise.all([
    getMistakeNotebook(user.id),
    getBookmarks(user.id),
  ])
  const bookmarkedIds = new Set(bookmarks.map((b) => b.examQuestionId))

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16 min-w-0 font-sans">
      {/* ── 1. PAGE HEADER (Matching /teacher/exams/new) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-border/60">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Mistake Notebook
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-primary/20 bg-primary/10 text-primary shadow-2xs"
            >
              <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Review Vault</span>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground border-border/70"
            >
              {mistakes.length} {mistakes.length === 1 ? "question" : "questions"} to review
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review questions you previously missed and reinforce your understanding.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 sm:h-9.5 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold border-border/70 shadow-2xs hover:border-primary/40 hover:text-primary active:scale-95 transition-all gap-1.5 cursor-pointer"
          >
            <Link href="/progress">
              <TrendingUp className="size-3.5" />
              <span>View Progress</span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 sm:h-9.5 px-4 sm:px-4.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs active:scale-95 transition-all gap-1.5 cursor-pointer"
          >
            <Link href="/exams">
              <BookOpen className="size-3.5" />
              <span>Browse Exams</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 2. SUMMARY METRICS (Only when mistakes exist) ── */}
      {mistakes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4.5">
          {/* Tile 1: Total Queue */}
          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Review Queue
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
                {mistakes.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Pending questions</p>
            </div>
            <div className="size-10 sm:size-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20 shadow-2xs">
              <RotateCcw className="size-5" />
            </div>
          </div>

          {/* Tile 2: XP Reward */}
          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Correct Reward
              </span>
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
                +15 XP
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Earned per correct review</p>
            </div>
            <div className="size-10 sm:size-11 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 ring-1 ring-violet-500/20 shadow-2xs">
              <Zap className="size-5" />
            </div>
          </div>

          {/* Tile 3: Learning Habit */}
          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Review Method
              </span>
              <p className="font-heading text-lg sm:text-xl font-extrabold text-foreground tracking-tight mt-1">
                Spaced Recall
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Retains memory retention</p>
            </div>
            <div className="size-10 sm:size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-2xs">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
        </div>
      )}

      {/* ── 3. QUESTION LIST OR EMPTY STATE ── */}
      {mistakes.length === 0 ? (
        <Empty className="rounded-2xl border border-border/70 bg-card p-8 sm:p-12 shadow-xs text-center">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-13 rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/25 shadow-2xs mx-auto flex items-center justify-center"
            >
              <CheckCircle2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle className="text-lg sm:text-2xl font-bold tracking-tight text-foreground mt-3">
              All Mistakes Cleared!
            </EmptyTitle>
            <EmptyDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
              You currently have no overdue mistake reviews. Keep taking assessments and practice tests to test your knowledge.
            </EmptyDescription>
          </EmptyHeader>

          <Button
            asChild
            className="rounded-xl h-10 px-5 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs active:scale-95 transition-all text-xs sm:text-sm gap-2 mt-4 cursor-pointer"
          >
            <Link href="/exams">
              <span>Browse Available Exams</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="space-y-6 sm:space-y-8 min-w-0">
          {mistakes.map((m, index) => (
            <MistakeReviewCard
              key={m.id}
              questionNumber={index + 1}
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
