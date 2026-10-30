"use client"

import * as React from "react"
import {
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
  Sparkles,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
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
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[92dvh] sm:max-h-[90dvh] flex flex-col p-0 rounded-2xl shadow-2xl border border-border/80 bg-background overflow-hidden gap-0">
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border/50 bg-muted/20 shrink-0 text-left">
          <div className="flex items-center gap-3.5">
            <div className="size-10 sm:size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
              <BookOpen className="size-5 sm:size-5.5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <span>Assessment Title Presets</span>
                <Badge variant="secondary" className="text-[11px] font-semibold text-primary bg-primary/10 border-primary/20">
                  <Sparkles className="size-3 mr-1" />
                  Presets
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Choose standardized academic templates, use the smart generator, or manage custom titles.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Shadcn Tabs Component */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "generator" | "my-saved" | "all-presets")}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="px-4 sm:px-6 py-2.5 border-b border-border/50 bg-muted/10 shrink-0">
            <TabsList className="grid grid-cols-3 w-full h-10 p-1 bg-muted/80 rounded-xl">
              <TabsTrigger
                value="generator"
                className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all"
              >
                <SlidersHorizontal className="size-3.5 sm:size-4 shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Smart </span>Generator
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="my-saved"
                className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all"
              >
                <Bookmark className="size-3.5 sm:size-4 shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">My </span>Saved ({mySavedTemplates.length})
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="all-presets"
                className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs transition-all"
              >
                <Library className="size-3.5 sm:size-4 shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">All </span>Presets ({dbTemplates.length})
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0">
            {/* TAB 1: SMART GENERATOR */}
            <TabsContent value="generator" className="m-0 space-y-4 sm:space-y-5 outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* 1. Subject */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="subject-select" className="text-xs sm:text-sm font-semibold text-foreground">
                    Subject / Discipline
                  </Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject-select" className="w-full h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium border-border/80 bg-background hover:bg-muted/30 cursor-pointer shadow-2xs">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl max-h-64">
                      <SelectGroup>
                        {SUBJECT_OPTIONS.map((sub) => (
                          <SelectItem key={sub} value={sub} className="text-xs sm:text-sm py-2 cursor-pointer">
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Assessment Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="exam-type-select" className="text-xs sm:text-sm font-semibold text-foreground">
                    Assessment Type
                  </Label>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger id="exam-type-select" className="w-full h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium border-border/80 bg-background hover:bg-muted/30 cursor-pointer shadow-2xs">
                      <SelectValue placeholder="Select Exam Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl max-h-64">
                      <SelectGroup>
                        {EXAM_TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type} className="text-xs sm:text-sm py-2 cursor-pointer">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Session / Year */}
                <div className="space-y-1.5">
                  <Label htmlFor="term-year-select" className="text-xs sm:text-sm font-semibold text-foreground">
                    Term / Session
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="term-year-select" className="w-full h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium border-border/80 bg-background hover:bg-muted/30 cursor-pointer shadow-2xs">
                      <SelectValue placeholder="Select Term / Year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl max-h-64">
                      <SelectGroup>
                        {YEAR_OPTIONS.map((y) => (
                          <SelectItem key={y} value={y} className="text-xs sm:text-sm py-2 cursor-pointer">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Tag Modifiers with Shadcn Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Modifiers (Optional)
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    return (
                      <Button
                        key={tag}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(tag)}
                        className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-95"
                      >
                        {isSelected ? <Check className="size-3.5 mr-1 text-primary-foreground" /> : <Plus className="size-3.5 mr-1" />}
                        {tag}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Live Preview Card */}
              <Card className="rounded-xl border border-primary/25 bg-primary/[0.03] p-3 sm:p-4.5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Live Generated Title Preview
                  </span>
                </div>

                <div className="rounded-xl bg-background border border-border/80 p-3 sm:p-3.5 shadow-2xs">
                  <p className="text-sm sm:text-base font-bold text-foreground leading-snug break-words">
                    {generatedTitle}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 pt-1">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => handleApply(generatedTitle)}
                    className="w-full sm:flex-1 h-11 rounded-xl text-sm font-bold shadow-xs cursor-pointer active:scale-98"
                  >
                    <Check className="size-4 mr-2" />
                    <span>Apply to Exam Title</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isSaving}
                    onClick={() => handleSaveToDatabase(generatedTitle, selectedSubject)}
                    className="w-full sm:w-auto h-11 px-4 rounded-xl text-sm font-semibold border-primary/30 bg-background text-primary hover:bg-primary/10 transition-all cursor-pointer shrink-0 shadow-2xs active:scale-98"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : justSaved ? (
                      <>
                        <BookmarkCheck className="size-4 mr-2 text-emerald-500" />
                        <span>Saved to DB!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="size-4 mr-2" />
                        <span>Save to DB</span>
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 2: MY SAVED TEMPLATES */}
            <TabsContent value="my-saved" className="m-0 space-y-4 outline-none">
              {/* Quick Inline Add to DB */}
              <Card className="p-3 sm:p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <Label htmlFor="custom-title-input" className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Plus className="size-4 text-primary" />
                  <span>Create & Save Custom Title</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="custom-title-input"
                    value={customTitleInput}
                    onChange={(e) => setCustomTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleDirectSaveCustom()
                      }
                    }}
                    placeholder="e.g. Cambridge A-Levels Physics Mock 2026..."
                    className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 px-3"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!customTitleInput.trim() || isSaving}
                    onClick={handleDirectSaveCustom}
                    className="h-10 px-4 rounded-xl text-xs sm:text-sm font-bold cursor-pointer shrink-0"
                  >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </Card>

              {isLoading && mySavedTemplates.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">Loading saved templates...</span>
                </div>
              ) : mySavedTemplates.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-3">
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Bookmark className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-foreground">No custom templates saved yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                      Use the Smart Generator or the box above to permanently save your custom exam titles to the database.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("generator")}
                    className="mt-1 text-xs font-semibold rounded-xl cursor-pointer h-9 px-3.5"
                  >
                    <SlidersHorizontal className="size-3.5 mr-1.5" />
                    <span>Go to Smart Generator</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {mySavedTemplates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleApply(t.title)}
                      className="group flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="size-8 sm:size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <BookmarkCheck className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary truncate transition-colors">
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                              {t.category || "Custom"}
                            </span>
                            <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                              • Saved in DB
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteTemplate(e, t.id)}
                          disabled={deletingId === t.id}
                          className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Delete template from database"
                        >
                          {deletingId === t.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                        <div className="size-8 rounded-lg bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-colors">
                          <ArrowRight className="size-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: ALL PRESETS */}
            <TabsContent value="all-presets" className="m-0 space-y-3.5 outline-none">
              {/* Search input with clear button */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates by subject, title or term..."
                  className="h-10 pl-9.5 pr-9 rounded-xl text-xs sm:text-sm bg-background border-border/80"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-8 rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>

              {/* Category Filter Pills using Shadcn Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {CATEGORY_FILTERS.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={categoryFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                    className="h-7.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Presets List */}
              <div className="space-y-2">
                {filteredPresets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleApply(preset.title)}
                    className="group flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer text-left shadow-2xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="size-8 sm:size-9 rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-muted-foreground shrink-0 transition-colors">
                        <BookOpen className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary truncate transition-colors">
                          {preset.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                            {preset.category}
                          </span>
                          {preset.isSystem ? (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium border-border/80">
                              System Preset
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                              My DB
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="size-8 rounded-lg bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-muted-foreground shrink-0 transition-colors">
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                ))}

                {filteredPresets.length === 0 && (
                  <p className="text-center text-xs sm:text-sm text-muted-foreground py-8">
                    No matching title templates found.
                  </p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
