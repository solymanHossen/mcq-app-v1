"use client"

import * as React from "react"
import { useActionState, useState, useRef } from "react"
import Link from "next/link"
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  FileCheck2,
  X,
  ArrowRight,
  Info,
  HelpCircle,
} from "lucide-react"

import { bulkImportQuestionsAction } from "@/modules/question-bank/actions"
import {
  IMPORT_TEMPLATE_HEADER,
  IMPORT_COLUMNS,
} from "@/modules/question-bank/validators"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const MANDATORY_COLUMNS = [
  "subject",
  "topic",
  "difficulty",
  "questionText",
  "optionA",
  "optionB",
  "optionC",
  "optionD",
  "correctOption",
] as const

const OPTIONAL_COLUMNS = [
  "explanation",
  "codeSnippet",
  "codeLanguage",
  "imageUrl",
] as const

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function ImportForm() {
  const [state, formAction, isPending] = useActionState(
    bulkImportQuestionsAction,
    undefined
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (fileInputRef.current) {
        const dt = new DataTransfer()
        dt.items.add(file)
        fileInputRef.current.files = dt.files
      }
    }
  }

  function handleClearFile(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleCopyHeader() {
    navigator.clipboard.writeText(IMPORT_TEMPLATE_HEADER)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  function handleDownloadTemplate() {
    const sampleRow =
      'Physics,Mechanics,EASY,"What is the SI unit of force?",Joule,Newton,Pascal,Watt,B,"Force is measured in Newtons (N).",,,'
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(`${IMPORT_TEMPLATE_HEADER}\n${sampleRow}\n`)
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", csvContent)
    downloadAnchor.setAttribute(
      "download",
      "examhub_questions_import_template.csv"
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    document.body.removeChild(downloadAnchor)
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full space-y-6 sm:space-y-8">
        {/* ── CARD 1: CSV SCHEMA & EXPECTED COLUMNS ── */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                <FileSpreadsheet className="size-4.5 sm:size-5.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                    Expected CSV Format & Schema
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                  Standard comma-separated format matching single-question validation rules
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 border-border/70 shrink-0"
            >
              UTF-8 CSV
            </Badge>
          </div>

          <div className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload a CSV with one question per row. Each row is validated the same
              way the single-question form is; invalid rows and exact duplicates are
              skipped and reported, everything else is imported.
            </p>

            {/* Column Schema Badges */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Expected Columns ({IMPORT_COLUMNS.length})
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {MANDATORY_COLUMNS.length} required • {OPTIONAL_COLUMNS.length} optional
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {MANDATORY_COLUMNS.map((col) => (
                  <Badge
                    key={col}
                    variant="secondary"
                    className="font-mono text-xs px-2.5 py-1 rounded-lg border border-border/60 bg-muted/60"
                  >
                    <span className="text-destructive font-bold mr-1">*</span>
                    {col}
                  </Badge>
                ))}
                {OPTIONAL_COLUMNS.map((col) => (
                  <Badge
                    key={col}
                    variant="outline"
                    className="font-mono text-xs px-2.5 py-1 rounded-lg border-dashed border-border/80 text-muted-foreground"
                  >
                    {col}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Template Header Code Snippet Box */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  Header Row Specification
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyHeader}
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer rounded-lg hover:bg-muted/60"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy Header</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="h-8 px-2.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 gap-1.5 cursor-pointer rounded-lg"
                  >
                    <Download className="size-3.5" />
                    <span>Download Template</span>
                  </Button>
                </div>
              </div>

              <div className="relative rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-3.5 overflow-x-auto">
                <code className="font-mono text-xs text-foreground/90 whitespace-nowrap block select-all">
                  {IMPORT_TEMPLATE_HEADER}
                </code>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Tip: Values for <code className="text-foreground font-semibold">difficulty</code> must be EASY, MEDIUM, or HARD. <code className="text-foreground font-semibold">correctOption</code> must be A, B, C, or D.
              </p>
            </div>
          </div>
        </Card>

        {/* ── CARD 2: FILE UPLOAD & INGESTION FORM ── */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                <UploadCloud className="size-4.5 sm:size-5.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                    Upload CSV Document
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                  Attach your file to initiate automated row validation and database ingestion
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 border-border/70 shrink-0"
            >
              Step 2
            </Badge>
          </div>

          <form action={formAction} className="p-4 sm:p-6 lg:p-7 space-y-6">
            {/* Server Error Message */}
            {state && "error" in state && (
              <Alert
                variant="destructive"
                className="rounded-xl border-destructive/40 bg-destructive/10 text-destructive shadow-xs"
              >
                <AlertTriangle className="size-4.5 shrink-0" />
                <AlertTitle className="text-sm font-bold">Import Failed</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm mt-0.5 font-medium">
                  {state.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Interactive Drag & Drop Area */}
            <div className="space-y-2">
              <label
                htmlFor="file"
                className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5"
              >
                <span>Select Question Dataset (.csv)</span>
                <span className="text-destructive">*</span>
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative rounded-2xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group select-none",
                  isDragging
                    ? "border-primary bg-primary/10 ring-4 ring-primary/15"
                    : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <input
                  ref={fileInputRef}
                  id="file"
                  name="file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  required
                  className="sr-only"
                />

                {!selectedFile ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="size-12 sm:size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-xs">
                      <UploadCloud className="size-6 sm:size-7" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        Click to select file or drag & drop here
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                        Supported file format: Comma Separated Values (.csv), max 5MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8.5 px-4 rounded-xl text-xs font-semibold border-border/70 text-foreground pointer-events-none mt-1 shadow-2xs"
                    >
                      Browse Local Files
                    </Button>
                  </div>
                ) : (
                  <div className="w-full max-w-md bg-card border border-border/70 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileCheck2 className="size-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {formatBytes(selectedFile.size)} • Ready for ingestion
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleClearFile}
                      className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                      title="Remove file"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Auto-publish toggle */}
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5 sm:p-4 shadow-2xs">
              <Checkbox
                id="publishImmediately"
                name="publishImmediately"
                defaultChecked={true}
                className="mt-0.5"
              />
              <div className="flex flex-col gap-0.5">
                <label
                  htmlFor="publishImmediately"
                  className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer select-none"
                >
                  Publish to Question Bank immediately (Active)
                </label>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Mark imported questions as ACTIVE right away so you can add them to assessments immediately. If unchecked, questions will be saved as DRAFT.
                </p>
              </div>
            </div>

            {/* Action Buttons matching /teacher/exams/new */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
              <Button
                asChild
                variant="outline"
                className="h-11 sm:h-12 px-5 rounded-xl font-semibold text-sm sm:text-base border-border/70 order-2 sm:order-1"
              >
                <Link href="/teacher/questions">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isPending}
                className="h-11 sm:h-12 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all active:scale-[0.98] shadow-sm gap-2 order-1 sm:order-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Spinner data-icon="inline-start" className="size-4" />
                    <span>Processing & Validating...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-4.5" />
                    <span>Start Bulk Import</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* ── CARD 3: IMPORT SUMMARY & DETAILED DIAGNOSTICS ── */}
        {state && "totalRows" in state && (
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden animate-in fade-in-50 duration-200">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div
                  className={cn(
                    "size-9 sm:size-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ring-1",
                    state.imported > 0
                      ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 ring-amber-500/20"
                  )}
                >
                  {state.imported > 0 ? (
                    <CheckCircle2 className="size-4.5 sm:size-5.5" />
                  ) : (
                    <AlertTriangle className="size-4.5 sm:size-5.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                    Ingestion Execution Summary
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium hidden sm:block">
                    Detailed batch report with row-by-row diagnostics
                  </p>
                </div>
              </div>
              <Badge
                variant={state.imported > 0 ? "secondary" : "destructive"}
                className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
              >
                {state.imported > 0 ? "Completed" : "Action Needed"}
              </Badge>
            </div>

            <div className="p-4 sm:p-6 lg:p-7 space-y-6">
              {/* Stat Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 sm:p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total Processed
                  </p>
                  <p className="font-heading text-xl sm:text-2xl font-black text-foreground mt-1">
                    {state.totalRows}
                  </p>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    CSV Rows Read
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 sm:p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Imported
                  </p>
                  <p className="font-heading text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {state.imported}
                  </p>
                  <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                    Added to Bank
                  </span>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 sm:p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Duplicates
                  </p>
                  <p className="font-heading text-xl sm:text-2xl font-black text-foreground mt-1">
                    {state.skippedDuplicates}
                  </p>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Exact Hashes Skipped
                  </span>
                </div>

                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 sm:p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-destructive">
                    Invalid Rows
                  </p>
                  <p className="font-heading text-xl sm:text-2xl font-black text-destructive mt-1">
                    {state.invalidRows.length}
                  </p>
                  <span className="text-[11px] text-destructive/80 font-medium">
                    Validation Errors
                  </span>
                </div>
              </div>

              {/* Detailed Validation Error Diagnostics if any */}
              {state.invalidRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Rejected Rows Breakdown ({state.invalidRows.length})
                    </h3>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 sm:p-4">
                    {state.invalidRows.map((r) => (
                      <div
                        key={r.row}
                        className="p-2.5 rounded-lg bg-card/80 border border-border/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4"
                      >
                        <Badge
                          variant="outline"
                          className="font-mono text-[11px] px-2 py-0.5 border-destructive/40 text-destructive font-bold shrink-0 self-start sm:self-auto"
                        >
                          Row {r.row}
                        </Badge>
                        <span className="text-muted-foreground font-medium text-left flex-1 break-words">
                          {r.errors.join("; ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Call to Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium text-center sm:text-left">
                  {state.imported > 0
                    ? `${state.imported} question${state.imported > 1 ? "s" : ""} have been indexed and are ready to be assigned to assessments.`
                    : "No questions were imported. Please correct the invalid rows above and try again."}
                </p>
                <Button
                  asChild
                  className="h-10 px-5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs gap-2 shrink-0 w-full sm:w-auto"
                >
                  <Link href="/teacher/questions">
                    <span>View Question Bank</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
