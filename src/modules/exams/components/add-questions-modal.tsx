"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { LatexText } from "@/components/shared/latex-text"
import { addQuestionsToExamAction } from "@/modules/exams/exam-question-actions"
import {
  Plus,
  Search,
  FolderPlus,
  Loader2,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
} from "lucide-react"

export type BankQuestionItem = {
  id: string
  questionText: string
  subject: string
  topic: string
  difficulty: string
}

interface AddQuestionsModalProps {
  examId: string
  availableQuestions: BankQuestionItem[]
  trigger?: React.ReactNode
}

export function AddQuestionsModal({
  examId,
  availableQuestions,
  trigger,
}: AddQuestionsModalProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>("ALL")
  const [selectedSubject, setSelectedSubject] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  // Distinct subjects
  const subjects = React.useMemo(() => {
    const set = new Set(availableQuestions.map((q) => q.subject))
    return Array.from(set).sort()
  }, [availableQuestions])

  // Filtered questions
  const filtered = React.useMemo(() => {
    return availableQuestions.filter((q) => {
      const matchSearch =
        !search.trim() ||
        q.questionText.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase()) ||
        q.subject.toLowerCase().includes(search.toLowerCase())

      const matchDifficulty =
        selectedDifficulty === "ALL" || q.difficulty === selectedDifficulty

      const matchSubject =
        selectedSubject === "ALL" || q.subject === selectedSubject

      return matchSearch && matchDifficulty && matchSubject
    })
  }, [availableQuestions, search, selectedDifficulty, selectedSubject])

  function toggleQuestion(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSelectAll() {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((q) => q.id)))
    }
  }

  function handleAdd() {
    if (selected.size === 0) return
    startTransition(async () => {
      const result = await addQuestionsToExamAction(examId, Array.from(selected))
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Added ${result?.added ?? selected.size} question(s) to exam!`)
      setSelected(new Set())
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="gap-2 rounded-xl text-xs sm:text-sm font-semibold h-10 px-4 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" />
            <span>Add from Question Bank</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1.5 text-left border-b border-border/50 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderPlus className="size-4.5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Select Questions from Bank
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Search and select multiple-choice questions from your question bank. Questions already in this exam are hidden.
          </DialogDescription>
        </DialogHeader>

        {/* Filters & Search Toolbar */}
        <div className="py-3 space-y-3 shrink-0 border-b border-border/40">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search question text, topic, or subject..."
                className="pl-9 h-10 rounded-xl text-xs sm:text-sm"
              />
            </div>

            {/* Select All Toggle */}
            {filtered.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl text-xs font-semibold shrink-0"
                onClick={handleSelectAll}
              >
                {selected.size === filtered.length ? "Deselect All" : "Select All Filtered"}
              </Button>
            )}
          </div>

          {/* Filter Pills (Difficulty & Subject) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground font-semibold flex items-center gap-1">
              <Filter className="size-3" />
              Difficulty:
            </span>
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {diff}
              </button>
            ))}

            {subjects.length > 1 && (
              <>
                <span className="text-muted-foreground font-semibold ml-2">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-muted/50 border border-border/60 rounded-lg px-2 py-1 text-xs text-foreground outline-none"
                >
                  <option value="ALL">All Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {availableQuestions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <FolderPlus className="size-10 mx-auto text-muted-foreground/40" />
              <p className="font-semibold text-foreground text-sm">No Unused Questions in Bank</p>
              <p className="text-xs max-w-sm mx-auto">
                All questions in your bank are either already added to this exam or in draft status. You can create new questions in your question bank.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground text-sm">No questions match your filters</p>
              <p className="text-xs">Try clearing your search query or difficulty filter.</p>
            </div>
          ) : (
            filtered.map((q) => {
              const isChecked = selected.has(q.id)

              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  className={`group flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all duration-150 ${
                    isChecked
                      ? "bg-primary/5 border-primary/50 shadow-2xs"
                      : "bg-card border-border/70 hover:border-primary/30"
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleQuestion(q.id)}
                    className="mt-1 rounded-md"
                  />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                      <LatexText text={q.questionText} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <Badge variant="outline" className="px-2 py-0.5 rounded-md font-medium text-muted-foreground">
                        {q.subject}
                      </Badge>
                      <span className="text-muted-foreground/60">/</span>
                      <span className="text-muted-foreground">{q.topic}</span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 rounded ${
                          q.difficulty === "EASY"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : q.difficulty === "HARD"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {q.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Sticky Footer */}
        <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground font-medium">
            <span className="font-bold text-foreground">{selected.size}</span> question(s) selected
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-10 px-4 text-xs font-semibold flex-1 sm:flex-none"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl h-10 px-5 text-xs font-semibold gap-2 shadow-sm flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleAdd}
              disabled={isPending || selected.size === 0}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Adding Questions...</span>
                </>
              ) : (
                <>
                  <span>Add {selected.size} Questions to Exam</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
