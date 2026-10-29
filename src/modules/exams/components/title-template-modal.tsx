"use client"

import * as React from "react"
import {
  Sparkles,
  Check,
  Search,
  BookOpen,
  ArrowRight,
  Calculator,
  Atom,
  Binary,
  Languages,
  Landmark,
  Layers,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface TitleTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTitle: (title: string) => void
}

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Higher Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science & ICT",
  "English Language & Grammar",
  "English Literature",
  "General Knowledge & Current Affairs",
  "Economics & Statistics",
  "Business Studies & Accounting",
  "Social Science & Civics",
]

const EXAM_TYPE_OPTIONS = [
  "Mid-Term Examination",
  "Final Examination",
  "First Term Assessment",
  "Second Term Assessment",
  "Monthly Evaluation Test",
  "Weekly MCQ Quiz",
  "Mock Test & Model Exam",
  "Diagnostic Assessment",
  "Comprehensive Practice Test",
]

const YEAR_OPTIONS = [
  "2026",
  "2026-2027",
  "Spring 2026",
  "Fall 2026",
  "Semester 1",
  "Semester 2",
  "Batch 2026",
]

type PresetItem = {
  title: string
  category: string
  icon: React.ComponentType<{ className?: string }>
}

const POPULAR_PRESETS: PresetItem[] = [
  {
    title: "Mathematics Mid-Term Examination 2026",
    category: "Math",
    icon: Calculator,
  },
  {
    title: "Physics First Semester Final Exam",
    category: "Science",
    icon: Atom,
  },
  {
    title: "Computer Science & ICT Practice Quiz",
    category: "Tech",
    icon: Binary,
  },
  {
    title: "Chemistry Organic & Inorganic Mock Test",
    category: "Science",
    icon: Atom,
  },
  {
    title: "English Grammar & Vocabulary Assessment",
    category: "Language",
    icon: Languages,
  },
  {
    title: "Biology Chapter-Wise Diagnostic Test",
    category: "Science",
    icon: Atom,
  },
  {
    title: "Economics & Finance Monthly Evaluation",
    category: "Commerce",
    icon: Landmark,
  },
  {
    title: "General Knowledge & IQ Speed Quiz 2026",
    category: "General",
    icon: Sparkles,
  },
]

export function TitleTemplateModal({
  open,
  onOpenChange,
  onSelectTitle,
}: TitleTemplateModalProps) {
  const [selectedSubject, setSelectedSubject] = React.useState("Mathematics")
  const [selectedExamType, setSelectedExamType] = React.useState("Mid-Term Examination")
  const [selectedYear, setSelectedYear] = React.useState("2026")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"generator" | "presets">("generator")

  const generatedTitle = `${selectedSubject} ${selectedExamType} ${selectedYear}`.trim()

  const filteredPresets = React.useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_PRESETS
    const q = searchQuery.toLowerCase()
    return POPULAR_PRESETS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    )
  }, [searchQuery])

  function handleApply(titleToApply: string) {
    onSelectTitle(titleToApply)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xl p-0 rounded-2xl shadow-2xl border border-border/80 bg-popover overflow-hidden gap-0">
        {/* Header */}
        <div className="p-5 border-b border-border/50 bg-muted/15 flex items-start gap-3.5">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Exam Title Presets
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Select or generate standardized, professional exam titles with 1 click.
            </DialogDescription>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="px-5 pt-3 border-b border-border/50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("generator")}
            className={cn(
              "px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "generator"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="size-3.5" />
            <span>Dropdown Generator</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={cn(
              "px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "presets"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="size-3.5" />
            <span>Popular Templates ({POPULAR_PRESETS.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === "generator" ? (
            <div className="space-y-4">
              {/* Dropdowns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Subject */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Subject / Discipline
                  </label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full h-10 rounded-xl text-xs sm:text-sm font-semibold border-border/80 bg-background cursor-pointer">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl max-h-60">
                      <SelectGroup>
                        {SUBJECT_OPTIONS.map((sub) => (
                          <SelectItem key={sub} value={sub} className="text-xs sm:text-sm cursor-pointer">
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Assessment Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Exam / Assessment Type
                  </label>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger className="w-full h-10 rounded-xl text-xs sm:text-sm font-semibold border-border/80 bg-background cursor-pointer">
                      <SelectValue placeholder="Select Exam Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl max-h-60">
                      <SelectGroup>
                        {EXAM_TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type} className="text-xs sm:text-sm cursor-pointer">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Session / Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Academic Term / Year
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full h-10 rounded-xl text-xs sm:text-sm font-semibold border-border/80 bg-background cursor-pointer">
                      <SelectValue placeholder="Select Term / Year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl max-h-60">
                      <SelectGroup>
                        {YEAR_OPTIONS.map((y) => (
                          <SelectItem key={y} value={y} className="text-xs sm:text-sm cursor-pointer">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Live Preview & Apply Card */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                    Generated Title Preview
                  </span>
                  <Badge variant="outline" className="text-[11px] border-primary/30 text-primary font-bold">
                    Ready
                  </Badge>
                </div>
                <div className="rounded-lg bg-background/80 border border-border/60 p-3">
                  <p className="text-sm sm:text-base font-extrabold text-foreground leading-snug">
                    {generatedTitle}
                  </p>
                </div>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => handleApply(generatedTitle)}
                  className="w-full h-11 rounded-xl text-sm font-bold shadow-xs cursor-pointer active:scale-98"
                >
                  <Check className="size-4 mr-2" />
                  <span>Apply This Title to Exam</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates by subject or term..."
                  className="h-10 pl-9 rounded-xl text-xs sm:text-sm bg-background border-border/80"
                />
              </div>

              {/* Presets Grid */}
              <div className="space-y-2">
                {filteredPresets.map((preset) => {
                  const IconComp = preset.icon
                  return (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleApply(preset.title)}
                      className="group w-full flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer text-left shadow-2xs active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="size-8 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-muted-foreground shrink-0 transition-colors">
                          <IconComp className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary truncate transition-colors">
                            {preset.title}
                          </p>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            {preset.category}
                          </span>
                        </div>
                      </div>
                      <div className="size-7 rounded-lg bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-muted-foreground shrink-0 transition-colors">
                        <ArrowRight className="size-3.5" />
                      </div>
                    </button>
                  )
                })}
                {filteredPresets.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-6">
                    No matching title templates found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
