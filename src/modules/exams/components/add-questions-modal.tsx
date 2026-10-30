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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LatexText } from "@/components/shared/latex-text"
import { addQuestionsToExamAction } from "@/modules/exams/exam-question-actions"
import { cn } from "@/lib/utils"
import {
  Plus,
  Search,
  FolderPlus,
  Loader2,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
  X,
  Check,
  CheckCheck,
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
          <Button className="gap-2 rounded-xl text-xs sm:text-sm font-bold h-10 px-4 shadow-2xs bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all cursor-pointer">
            <Plus className="size-4" />
            <span>Add from Question Bank</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="w-[calc(100vw-1.25rem)] sm:w-[94vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[88dvh] sm:max-h-[85dvh] flex flex-col p-0 rounded-2xl sm:rounded-3xl shadow-2xl border border-border/80 bg-background overflow-hidden gap-0">
        {/* Master Header Bar */}
        <DialogHeader className="px-4 py-3.5 sm:px-6 sm:py-4.5 bg-muted/20 border-b border-border/50 text-left shrink-0 pr-10 sm:pr-12">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="size-9 sm:size-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                <FolderPlus className="size-4.5 sm:size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
                  Select Questions from Bank
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  Search and select multiple-choice questions to add to this exam
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full border-border/70 shrink-0 hidden sm:inline-flex bg-card shadow-2xs"
            >
              {filtered.length} Available
            </Badge>
          </div>
        </DialogHeader>

        {/* Filters & Search Toolbar Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-border/50 bg-muted/10 shrink-0 space-y-2.5 sm:space-y-3">
          {/* Search Input & Select All */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search question text, topic, or subject..."
                className="pl-10 pr-9 h-10 sm:h-10.5 rounded-xl text-xs sm:text-sm bg-background border-border/70 shadow-2xs focus-visible:ring-1 focus-visible:ring-primary/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {filtered.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 sm:h-10.5 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold border-border/70 bg-card hover:bg-muted shadow-2xs shrink-0 cursor-pointer active:scale-95 transition-all"
                onClick={handleSelectAll}
              >
                {selected.size === filtered.length ? "Deselect All" : "Select All Filtered"}
              </Button>
            )}
          </div>

          {/* Filter Pills (Difficulty & Subject) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-0.5">
                <Filter className="size-3 text-muted-foreground" />
                <span>Difficulty:</span>
              </span>

              {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                <Button
                  key={diff}
                  type="button"
                  variant={selectedDifficulty === diff ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={cn(
                    "h-7 sm:h-7.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95",
                    selectedDifficulty === diff
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {diff === "ALL" ? "All" : diff.charAt(0) + diff.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>

            {subjects.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <span>Subject:</span>
                </span>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger
                    size="sm"
                    className="w-auto min-w-[125px] sm:min-w-[145px] !h-7.5 sm:!h-8 !px-2.5 !py-1 !text-xs font-semibold rounded-lg bg-card border-border/70 shadow-2xs hover:bg-muted/50 cursor-pointer transition-colors [&>svg]:!size-3.5"
                  >
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    align="end"
                    className="rounded-xl border-border/70 shadow-xl min-w-[140px] p-1 z-50 bg-popover"
                  >
                    <SelectItem value="ALL" className="py-1.5 pl-2.5 pr-8 text-xs font-medium cursor-pointer rounded-md">
                      All Subjects
                    </SelectItem>
                    {subjects.map((sub) => (
                      <SelectItem
                        key={sub}
                        value={sub}
                        className="py-1.5 pl-2.5 pr-8 text-xs font-medium cursor-pointer rounded-md"
                      >
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 space-y-2.5 sm:space-y-3 min-h-0 overscroll-contain">
          {availableQuestions.length === 0 ? (
            <div className="py-12 sm:py-16 text-center text-muted-foreground space-y-3">
              <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground/60 mx-auto flex items-center justify-center">
                <FolderPlus className="size-6" />
              </div>
              <p className="font-bold text-foreground text-sm sm:text-base">No Unused Questions in Bank</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                All questions in your bank are either already added to this exam or in draft status. You can create new questions in your question bank.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 sm:py-16 text-center text-muted-foreground space-y-2">
              <p className="font-bold text-foreground text-sm sm:text-base">No questions match your filters</p>
              <p className="text-xs text-muted-foreground">Try clearing your search query or changing the difficulty filter.</p>
            </div>
          ) : (
            filtered.map((q, idx) => {
              const isChecked = selected.has(q.id)

              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  className={cn(
                    "group relative flex items-start justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.995]",
                    isChecked
                      ? "bg-primary/5 border-primary/60 ring-1 ring-primary/20 shadow-xs"
                      : "bg-card border-border/70 hover:border-primary/40 hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                    <div className="pt-0.5 shrink-0 flex items-center gap-2">
                      <div
                        className={cn(
                          "size-5 rounded-md border flex items-center justify-center transition-all",
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground shadow-2xs"
                            : "border-border/80 bg-background group-hover:border-primary/60"
                        )}
                      >
                        {isChecked && <Check className="size-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground/60 tabular-nums">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed select-none">
                        <LatexText text={q.questionText} />
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg border-border/70 bg-card text-foreground shadow-2xs"
                        >
                          {q.subject}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium px-2 py-0.5 rounded-lg border-border/60 bg-muted/30 text-muted-foreground max-w-[180px] sm:max-w-[260px] truncate shadow-2xs"
                        >
                          {q.topic}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-2xs",
                            q.difficulty === "EASY"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : q.difficulty === "HARD"
                              ? "border-destructive/30 bg-destructive/10 text-destructive dark:text-destructive"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              q.difficulty === "EASY"
                                ? "bg-emerald-500"
                                : q.difficulty === "HARD"
                                ? "bg-destructive"
                                : "bg-amber-500"
                            )}
                          />
                          <span>{q.difficulty}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right side selection indicator */}
                  <div className="shrink-0 self-center hidden sm:flex items-center pl-2">
                    {isChecked ? (
                      <Badge className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground border-transparent gap-1 shadow-2xs">
                        <Check className="size-3 stroke-[2.5]" />
                        <span>Selected</span>
                      </Badge>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground/60 group-hover:text-primary transition-colors flex items-center gap-1">
                        <Plus className="size-3.5" />
                        <span>Select</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Master Sticky Footer Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium self-start sm:self-auto">
            <Badge
              variant="secondary"
              className={cn(
                "font-bold text-xs px-2.5 py-0.5 rounded-full border border-border/60",
                selected.size > 0 ? "bg-primary/10 text-primary border-primary/20" : ""
              )}
            >
              {selected.size}
            </Badge>
            <span>of {filtered.length} question{filtered.length === 1 ? "" : "s"} selected</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-10 px-4 text-xs sm:text-sm font-bold border-border/70 bg-card hover:bg-muted active:scale-95 transition-all flex-1 sm:flex-initial shadow-2xs cursor-pointer"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl h-10 px-5 text-xs sm:text-sm font-bold gap-2 shadow-2xs active:scale-95 transition-all flex-1 sm:flex-initial bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50"
              onClick={handleAdd}
              disabled={isPending || selected.size === 0}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  <span>Adding Questions...</span>
                </>
              ) : (
                <>
                  <span>Add {selected.size} Question{selected.size === 1 ? "" : "s"} to Exam</span>
                  <ArrowRight className="size-4 shrink-0" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
