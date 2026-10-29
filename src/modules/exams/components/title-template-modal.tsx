"use client"

import * as React from "react"
import {
  Sparkles,
  Check,
  Search,
  BookOpen,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Plus,
  Loader2,
  SlidersHorizontal,
  X,
  Library,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
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
import {
  getTitleTemplatesAction,
  saveTitleTemplateAction,
  deleteTitleTemplateAction,
  type TitleTemplateDTO,
} from "@/modules/exams/template-actions"
import { DEFAULT_SYSTEM_TEMPLATES } from "@/modules/exams/template-constants"

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

const QUICK_TAGS = [
  "Paper 1",
  "Paper 2",
  "MCQ Special",
  "Chapter 1-4",
  "Model Test",
  "Shift A",
]

const CATEGORY_FILTERS = [
  "All",
  "Mathematics",
  "Science",
  "Technology",
  "Language",
  "Commerce",
]

// Fallback items converted to DTO shape
const FALLBACK_TEMPLATES: TitleTemplateDTO[] = DEFAULT_SYSTEM_TEMPLATES.map((t, i) => ({
  id: `system-seed-${i}`,
  title: t.title,
  category: t.category,
  subject: t.subject,
  examType: t.examType,
  year: t.year,
  isSystem: true,
  teacherId: null,
  createdAt: new Date().toISOString(),
}))

export function TitleTemplateModal({
  open,
  onOpenChange,
  onSelectTitle,
}: TitleTemplateModalProps) {
  const [selectedSubject, setSelectedSubject] = React.useState("Mathematics")
  const [selectedExamType, setSelectedExamType] = React.useState("Mid-Term Examination")
  const [selectedYear, setSelectedYear] = React.useState("2026")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"generator" | "my-saved" | "all-presets">("generator")
  const [categoryFilter, setCategoryFilter] = React.useState("All")

  // Quick custom save in "My Saved" tab
  const [customTitleInput, setCustomTitleInput] = React.useState("")

  // Database state initialized with fallbacks
  const [dbTemplates, setDbTemplates] = React.useState<TitleTemplateDTO[]>(FALLBACK_TEMPLATES)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [justSaved, setJustSaved] = React.useState(false)

  // Construct generated title
  const tagsSuffix = selectedTags.length > 0 ? ` - ${selectedTags.join(", ")}` : ""
  const generatedTitle = `${selectedSubject} ${selectedExamType} ${selectedYear}${tagsSuffix}`.trim()

  // Load templates from database when modal opens
  React.useEffect(() => {
    if (!open) return
    let isMounted = true
    setIsLoading(true)

    getTitleTemplatesAction()
      .then((res) => {
        if (isMounted && res.success && res.templates.length > 0) {
          setDbTemplates(res.templates)
        }
      })
      .catch((err) => {
        console.error("Failed to load templates from DB:", err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [open])

  const mySavedTemplates = React.useMemo(() => {
    return dbTemplates.filter((t) => !t.isSystem)
  }, [dbTemplates])

  const filteredPresets = React.useMemo(() => {
    let list = dbTemplates

    if (categoryFilter !== "All") {
      list = list.filter(
        (t) =>
          t.category.toLowerCase() === categoryFilter.toLowerCase() ||
          (t.subject && t.subject.toLowerCase().includes(categoryFilter.toLowerCase()))
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subject && p.subject.toLowerCase().includes(q))
      )
    }

    return list
  }, [dbTemplates, categoryFilter, searchQuery])

  function handleApply(titleToApply: string) {
    onSelectTitle(titleToApply)
    onOpenChange(false)
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  async function handleSaveToDatabase(titleToSave: string, category: string = "Custom") {
    if (!titleToSave.trim() || isSaving) return
    setIsSaving(true)
    setJustSaved(false)

    try {
      const res = await saveTitleTemplateAction({
        title: titleToSave,
        category,
        subject: selectedSubject,
        examType: selectedExamType,
        year: selectedYear,
      })

      if (res.success && res.template) {
        setDbTemplates((prev) => [
          res.template!,
          ...prev.filter((t) => t.id !== res.template!.id),
        ])
        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 2500)
      } else if (!res.success) {
        const localTemplate: TitleTemplateDTO = {
          id: `local-${Date.now()}`,
          title: titleToSave,
          category,
          subject: selectedSubject,
          examType: selectedExamType,
          year: selectedYear,
          isSystem: false,
          teacherId: "teacher",
          createdAt: new Date().toISOString(),
        }
        setDbTemplates((prev) => [localTemplate, ...prev])
        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 2500)
      }
    } catch {
      const localTemplate: TitleTemplateDTO = {
        id: `local-${Date.now()}`,
        title: titleToSave,
        category,
        subject: selectedSubject,
        examType: selectedExamType,
        year: selectedYear,
        isSystem: false,
        teacherId: "teacher",
        createdAt: new Date().toISOString(),
      }
      setDbTemplates((prev) => [localTemplate, ...prev])
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2500)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDirectSaveCustom() {
    const title = customTitleInput.trim()
    if (!title) return
    await handleSaveToDatabase(title, "Custom")
    setCustomTitleInput("")
  }

  async function handleDeleteTemplate(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (deletingId) return
    setDeletingId(id)

    try {
      await deleteTitleTemplateAction(id)
      setDbTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch {
      setDbTemplates((prev) => prev.filter((t) => t.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[92dvh] sm:max-h-[90dvh] flex flex-col p-0 rounded-xl sm:rounded-2xl shadow-2xl border border-border/80 bg-popover overflow-hidden gap-0">
        <DialogDescription className="sr-only">
          Select or generate standardized exam titles
        </DialogDescription>

        {/* Minimal Header: Title only, compact on mobile */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-4.5 border-b border-border/50 bg-muted/10 flex items-center justify-between shrink-0">
          <DialogTitle className="text-xs sm:text-lg font-bold text-foreground tracking-tight">
            Exam Title Presets
          </DialogTitle>
        </div>

        {/* Segmented Control Navigation: compact 3-column grid */}
        <div className="px-2.5 sm:px-6 py-2 sm:pt-3 sm:pb-2.5 border-b border-border/50 bg-background/50 shrink-0">
          <div className="grid grid-cols-3 p-0.5 sm:p-1 bg-muted/60 rounded-lg sm:rounded-xl gap-0.5 sm:gap-1 w-full">
            <button
              type="button"
              onClick={() => setActiveTab("generator")}
              className={cn(
                "py-1.5 px-0.5 sm:py-2 sm:px-3 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-2 truncate",
                activeTab === "generator"
                  ? "bg-background text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="size-3 sm:size-4 shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">Smart </span>Generator
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("my-saved")}
              className={cn(
                "py-1.5 px-0.5 sm:py-2 sm:px-3 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-2 truncate",
                activeTab === "my-saved"
                  ? "bg-background text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Bookmark className="size-3 sm:size-4 shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">My </span>Saved ({mySavedTemplates.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("all-presets")}
              className={cn(
                "py-1.5 px-0.5 sm:py-2 sm:px-3 rounded-md sm:rounded-lg text-[11px] sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-2 truncate",
                activeTab === "all-presets"
                  ? "bg-background text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Library className="size-3 sm:size-4 shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">All </span>Presets ({dbTemplates.length})
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-2.5 sm:p-6 space-y-2.5 sm:space-y-5 overflow-y-auto">
          {/* TAB 1: SMART GENERATOR */}
          {activeTab === "generator" && (
            <div className="space-y-2.5 sm:space-y-5">
              {/* Dropdowns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {/* 1. Subject */}
                <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                  <label className="text-[11px] sm:text-base font-semibold text-foreground flex items-center justify-between">
                    <span>Subject / Discipline</span>
                  </label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full h-8.5 sm:h-12 rounded-md sm:rounded-xl text-xs sm:text-base font-medium sm:font-semibold border-border/80 bg-background/80 hover:bg-background px-2.5 sm:px-4 py-1.5 sm:py-3 cursor-pointer shadow-2xs">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl max-h-64">
                      <SelectGroup>
                        {SUBJECT_OPTIONS.map((sub) => (
                          <SelectItem key={sub} value={sub} className="text-xs sm:text-base py-1.5 sm:py-2.5 cursor-pointer">
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Assessment Type */}
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[11px] sm:text-base font-semibold text-foreground">
                    Assessment Type
                  </label>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger className="w-full h-8.5 sm:h-12 rounded-md sm:rounded-xl text-xs sm:text-base font-medium sm:font-semibold border-border/80 bg-background/80 hover:bg-background px-2.5 sm:px-4 py-1.5 sm:py-3 cursor-pointer shadow-2xs">
                      <SelectValue placeholder="Select Exam Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl max-h-64">
                      <SelectGroup>
                        {EXAM_TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type} className="text-xs sm:text-base py-1.5 sm:py-2.5 cursor-pointer">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Session / Year */}
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[11px] sm:text-base font-semibold text-foreground">
                    Term / Session
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full h-8.5 sm:h-12 rounded-md sm:rounded-xl text-xs sm:text-base font-medium sm:font-semibold border-border/80 bg-background/80 hover:bg-background px-2.5 sm:px-4 py-1.5 sm:py-3 cursor-pointer shadow-2xs">
                      <SelectValue placeholder="Select Term / Year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl max-h-64">
                      <SelectGroup>
                        {YEAR_OPTIONS.map((y) => (
                          <SelectItem key={y} value={y} className="text-xs sm:text-base py-1.5 sm:py-2.5 cursor-pointer">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Tag Modifiers */}
              <div className="space-y-1 sm:space-y-2 pt-0.5 sm:pt-1">
                <span className="text-[10px] sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Modifiers (Optional)
                </span>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-2 py-0.5 sm:px-3.5 sm:py-2 rounded-md sm:rounded-xl text-[10px] sm:text-sm font-medium border transition-all cursor-pointer active:scale-95",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-2xs font-semibold"
                            : "border-border/70 bg-card hover:bg-muted text-foreground"
                        )}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-lg sm:rounded-xl border border-primary/25 bg-primary/[0.04] p-2.5 sm:p-5 space-y-2 sm:space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="size-1.5 sm:size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-primary">
                    Live Generated Title
                  </span>
                </div>

                <div className="rounded-md sm:rounded-xl bg-background border border-border/80 p-2 sm:p-4 shadow-2xs">
                  <p className="text-xs sm:text-lg font-bold text-foreground leading-snug break-words">
                    {generatedTitle}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3">
                  {/* Primary 1-Click Apply */}
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => handleApply(generatedTitle)}
                    className="w-full sm:flex-1 h-8 sm:h-12 rounded-md sm:rounded-xl text-[11px] sm:text-base font-bold shadow-xs cursor-pointer active:scale-98"
                  >
                    <Check className="size-3.5 sm:size-4.5 mr-1 sm:mr-2" />
                    <span>Apply to Exam</span>
                  </Button>

                  {/* Save to Database Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isSaving}
                    onClick={() => handleSaveToDatabase(generatedTitle, selectedSubject)}
                    className="w-full sm:w-auto h-8 sm:h-12 px-2.5 sm:px-5 rounded-md sm:rounded-xl text-[11px] sm:text-base font-semibold border-primary/40 bg-background text-primary hover:bg-primary/10 transition-all cursor-pointer shrink-0 shadow-2xs active:scale-98"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-3 sm:size-4 mr-1 sm:mr-2 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : justSaved ? (
                      <>
                        <BookmarkCheck className="size-3.5 sm:size-4.5 mr-1 sm:mr-2 text-emerald-500" />
                        <span>Saved to DB!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="size-3 sm:size-4.5 mr-1 sm:mr-2" />
                        <span>Save to DB</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY SAVED TEMPLATES */}
          {activeTab === "my-saved" && (
            <div className="space-y-2.5 sm:space-y-4">
              {/* Quick Inline Add to DB */}
              <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl border border-border/80 bg-muted/20 space-y-1.5 sm:space-y-2.5">
                <span className="text-[11px] sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Plus className="size-3.5 sm:size-4 text-primary" />
                  <span>Create & Save Custom Title</span>
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    value={customTitleInput}
                    onChange={(e) => setCustomTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleDirectSaveCustom()
                      }
                    }}
                    placeholder="Enter custom title name..."
                    className="h-8 sm:h-11 text-xs sm:text-base rounded-md sm:rounded-xl bg-background border-border/80 px-2.5 sm:px-3"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!customTitleInput.trim() || isSaving}
                    onClick={handleDirectSaveCustom}
                    className="h-8 sm:h-11 px-3 sm:px-5 rounded-md sm:rounded-xl text-xs sm:text-sm font-bold cursor-pointer shrink-0"
                  >
                    {isSaving ? <Loader2 className="size-3.5 sm:size-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>

              {isLoading && mySavedTemplates.length === 0 ? (
                <div className="flex items-center justify-center py-6 sm:py-12 text-muted-foreground gap-2">
                  <Loader2 className="size-4 sm:size-5 animate-spin text-primary" />
                  <span className="text-xs sm:text-base font-medium">Loading saved templates...</span>
                </div>
              ) : mySavedTemplates.length === 0 ? (
                <div className="text-center py-6 sm:py-12 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-2 sm:space-y-3">
                  <div className="size-9 sm:size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Bookmark className="size-4 sm:size-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-base font-bold text-foreground">No custom templates saved yet</p>
                    <p className="text-[11px] sm:text-sm text-muted-foreground max-w-sm mx-auto mt-0.5 sm:mt-1">
                      Use the Smart Generator or the box above to permanently save your custom exam titles to the database.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("generator")}
                    className="mt-1 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-xl cursor-pointer h-8 sm:h-10 px-3 sm:px-4"
                  >
                    <SlidersHorizontal className="size-3 sm:size-4 mr-1.5 sm:mr-2" />
                    <span>Go to Smart Generator</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5 sm:space-y-2.5">
                  {mySavedTemplates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleApply(t.title)}
                      className="group flex items-center justify-between p-2 sm:p-4 rounded-lg sm:rounded-xl border border-border/70 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 pr-2">
                        <div className="size-7 sm:size-9 rounded-md sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <BookmarkCheck className="size-3.5 sm:size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-base font-bold text-foreground group-hover:text-primary truncate transition-colors">
                            {t.title}
                          </p>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                            <span className="text-[9px] sm:text-xs font-semibold text-muted-foreground">
                              {t.category || "Custom"}
                            </span>
                            <span className="text-[9px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                              • Saved in DB
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTemplate(e, t.id)}
                          disabled={deletingId === t.id}
                          className="size-7 sm:size-9 rounded-md sm:rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete template from database"
                        >
                          {deletingId === t.id ? (
                            <Loader2 className="size-3 sm:size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5 sm:size-4" />
                          )}
                        </button>
                        <div className="size-7 sm:size-9 rounded-md sm:rounded-lg bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-colors">
                          <ArrowRight className="size-3 sm:size-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ALL PRESETS */}
          {activeTab === "all-presets" && (
            <div className="space-y-2 sm:space-y-3.5">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 size-3.5 sm:size-4.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates by subject, title or term..."
                  className="h-8 sm:h-12 pl-8 sm:pl-10 pr-7 sm:pr-9 rounded-md sm:rounded-xl text-xs sm:text-base bg-background border-border/80"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 size-5 sm:size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3 sm:size-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer",
                      categoryFilter === cat
                        ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Presets List */}
              <div className="space-y-1.5 sm:space-y-2.5">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApply(preset.title)}
                    className="group w-full flex items-center justify-between p-2 sm:p-4 rounded-lg sm:rounded-xl border border-border/70 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer text-left shadow-2xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 pr-2">
                      <div className="size-7 sm:size-9 rounded-md sm:rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-muted-foreground shrink-0 transition-colors">
                        <BookOpen className="size-3.5 sm:size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-base font-bold text-foreground group-hover:text-primary truncate transition-colors">
                          {preset.title}
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                          <span className="text-[9px] sm:text-xs font-semibold text-muted-foreground">
                            {preset.category}
                          </span>
                          {preset.isSystem ? (
                            <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1 sm:px-2 py-0 font-medium">
                              Preset
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-1 sm:px-2 py-0 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                              My DB
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="size-6 sm:size-8 rounded-md sm:rounded-lg bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-muted-foreground shrink-0 transition-colors">
                      <ArrowRight className="size-3 sm:size-4" />
                    </div>
                  </button>
                ))}

                {filteredPresets.length === 0 && (
                  <p className="text-center text-xs sm:text-sm text-muted-foreground py-6">
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
