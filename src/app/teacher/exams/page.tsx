import Link from "next/link"
import { requireUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { listExams } from "@/modules/exams/queries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import {
  ClipboardListIcon,
  Plus,
  Clock,
  ArrowRight,
  BookOpen,
  Send,
  FileEdit,
  Archive,
  Layers,
} from "lucide-react"
import { PagePagination } from "@/components/shared/page-pagination"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"
import { ShareExamModal } from "@/modules/exams/components/share-exam-modal"
import { cn } from "@/lib/utils"
import type { ExamStatus } from "@/prisma/generated/prisma/client"

export const instant = false

const STATUS_VARIANT = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
} as const

const TABS: { label: string; value?: ExamStatus }[] = [
  { label: "All Exams", value: undefined },
  { label: "Drafts", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
]

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const user = await requireUser()
  const params = await searchParams
  const status = params.status as ExamStatus | undefined
  const search = params.q?.trim()

  const [
    { items, total, page, pageCount },
    draftsCount,
    publishedCount,
    archivedCount,
  ] = await Promise.all([
    listExams({
      teacherId: user.id,
      status,
      page: params.page ? Number(params.page) : 1,
      search,
    }),
    prisma.exam.count({ where: { teacherId: user.id, status: "DRAFT" } }),
    prisma.exam.count({ where: { teacherId: user.id, status: "PUBLISHED" } }),
    prisma.exam.count({ where: { teacherId: user.id, status: "ARCHIVED" } }),
  ])

  const totalAll = draftsCount + publishedCount + archivedCount

  function tabHref(tabVal?: ExamStatus) {
    const sp = new URLSearchParams()
    if (tabVal) sp.set("status", tabVal)
    if (search) sp.set("q", search)
    const qs = sp.toString()
    return qs ? `?${qs}` : "/teacher/exams"
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Larger Font Size and Subtitle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Authored Assessments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            <span className="font-semibold text-foreground">{total}</span> assessment{total === 1 ? "" : "s"}
            {search ? ` matching "${search}"` : ""} · Manage schedules, publishing status, and question banks.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-11 rounded-xl px-5 text-sm font-semibold shadow-xs"
        >
          <Link href="/teacher/exams/new">
            <Plus className="mr-2 size-4" />
            <span>Create New Exam</span>
          </Link>
        </Button>
      </div>

      {/* 4-Tile Summary Metrics Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Metric 1: Total */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Exams
            </span>
            <span className="flex size-8.5 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Layers className="size-4" />
            </span>
          </div>
          <div className="mt-2.5">
            <p className="font-heading text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
              {totalAll}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Lifetime authored tracks
            </p>
          </div>
        </div>

        {/* Metric 2: Published */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Published
            </span>
            <span className="flex size-8.5 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <Send className="size-4" />
            </span>
          </div>
          <div className="mt-2.5">
            <p className="font-heading text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {publishedCount}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Live for candidate attempts
            </p>
          </div>
        </div>

        {/* Metric 3: Drafts */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Drafts
            </span>
            <span className="flex size-8.5 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
              <FileEdit className="size-4" />
            </span>
          </div>
          <div className="mt-2.5">
            <p className="font-heading text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
              {draftsCount}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Work in progress
            </p>
          </div>
        </div>

        {/* Metric 4: Archived */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Archived
            </span>
            <span className="flex size-8.5 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border/60 shadow-2xs">
              <Archive className="size-4" />
            </span>
          </div>
          <div className="mt-2.5">
            <p className="font-heading text-2xl font-extrabold tracking-tight text-foreground tabular-nums">
              {archivedCount}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Retired from catalog
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Debounced Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
          <nav
            role="tablist"
            aria-label="Filter exams by status"
            className="flex w-fit min-w-fit items-center gap-1.5 rounded-2xl bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-2"
          >
            {TABS.map((tab) => {
              const isActive = status === tab.value
              return (
                <Link
                  key={tab.label}
                  href={tabHref(tab.value)}
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 select-none",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  )}
                >
                  <span>{tab.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="w-full sm:max-w-xs">
          <DebouncedSearchInput
            placeholder="Search exams by title…"
            className="w-full"
          />
        </div>
      </div>

      {/* Content Area with Profile-Style Rounded Card */}
      {total === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-8 sm:p-12 shadow-xs">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardListIcon className="size-8 text-primary" />
              </EmptyMedia>
              <EmptyTitle className="font-heading text-xl font-bold">
                No assessments found
              </EmptyTitle>
              <EmptyDescription className="text-sm text-muted-foreground sm:text-base max-w-sm mx-auto">
                Create a new exam track and populate it with questions from your vault.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                asChild
                size="lg"
                className="h-11 rounded-xl px-6 text-sm font-semibold shadow-xs"
              >
                <Link href="/teacher/exams/new">
                  <Plus className="mr-2 size-4" />
                  <span>Create Your First Exam</span>
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-2 sm:p-4 shadow-xs">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-foreground py-3.5">Title</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Status</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Duration</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Questions</TableHead>
                  <TableHead className="font-bold text-foreground py-3.5">Created</TableHead>
                  <TableHead className="text-right font-bold text-foreground py-3.5">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((exam) => (
                  <TableRow key={exam.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="py-4">
                      <Link
                        href={`/teacher/exams/${exam.id}`}
                        className="font-heading font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {exam.title}
                      </Link>
                      {exam.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {exam.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={STATUS_VARIANT[exam.status]}
                        className="rounded-lg text-xs font-semibold"
                      >
                        {exam.status === "PUBLISHED"
                          ? "Published"
                          : exam.status === "DRAFT"
                            ? "Draft"
                            : "Archived"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-medium">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5 text-primary" />
                        <span>{exam.durationMinutes} min</span>
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-medium">
                      {exam._count.examQuestions} Qs
                    </TableCell>
                    <TableCell className="py-4 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(exam.createdAt))}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {exam.status === "PUBLISHED" && (
                          <ShareExamModal exam={exam} />
                        )}
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl text-xs font-semibold shadow-2xs hover:border-primary/40"
                        >
                          <Link href={`/teacher/exams/${exam.id}`}>
                            <span>Manage</span>
                            <ArrowRight className="ml-1 size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PagePagination page={page} pageCount={pageCount} searchParams={params} />
        </div>
      )}
    </div>
  )
}
