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

const TABS: {
  label: string
  value?: ExamStatus
  countKey: "all" | "drafts" | "published" | "archived"
}[] = [
  { label: "All Exams", value: undefined, countKey: "all" },
  { label: "Drafts", value: "DRAFT", countKey: "drafts" },
  { label: "Published", value: "PUBLISHED", countKey: "published" },
  { label: "Archived", value: "ARCHIVED", countKey: "archived" },
]

function StatusBadge({ status }: { status: ExamStatus }) {
  if (status === "PUBLISHED") {
    return (
      <Badge
        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20"
      >
        <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
        <span>Published</span>
      </Badge>
    )
  }

  if (status === "DRAFT") {
    return (
      <Badge
        variant="secondary"
        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5 border border-border/70 text-foreground bg-muted/60"
      >
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>Draft</span>
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase inline-flex items-center gap-1.5 text-muted-foreground border-border/70"
    >
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      <span>Archived</span>
    </Badge>
  )
}

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

  const countsMap = {
    all: totalAll,
    drafts: draftsCount,
    published: publishedCount,
    archived: archivedCount,
  }

  function tabHref(tabVal?: ExamStatus) {
    const sp = new URLSearchParams()
    if (tabVal) sp.set("status", tabVal)
    if (search) sp.set("q", search)
    const qs = sp.toString()
    return qs ? `?${qs}` : "/teacher/exams"
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 sm:space-y-8 pb-10">
      {/* Header with Larger Font Size and Subtitle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Authored Assessments
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">{total}</span> assessment{total === 1 ? "" : "s"}
            {search ? ` matching "${search}"` : ""} · Manage schedules, publishing status, and question banks.
          </p>
        </div>
        <Button
          asChild
          className="h-10 sm:h-11 rounded-xl px-4 sm:px-5 text-xs sm:text-sm font-semibold shadow-2xs gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 self-start sm:self-auto"
        >
          <Link href="/teacher/exams/new">
            <Plus className="size-4" />
            <span>Create New Exam</span>
          </Link>
        </Button>
      </div>

      {/* Filter Tabs and Debounced Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
          <nav
            role="tablist"
            aria-label="Filter exams by status"
            className="flex w-fit min-w-fit items-center gap-1 rounded-2xl bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-1.5 border border-border/40"
          >
            {TABS.map((tab) => {
              const isActive = status === tab.value
              const count = countsMap[tab.countKey]
              return (
                <Link
                  key={tab.label}
                  href={tabHref(tab.value)}
                  className={cn(
                    "flex shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 select-none",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tabular-nums transition-colors",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted-foreground/15 text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
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
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border/80 bg-muted/10 p-8 sm:p-14 text-center shadow-2xs">
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
        <div className="w-full max-w-full min-w-0 space-y-6">
          <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-2xs">
            <Table className="w-full">
              <TableHeader className="bg-muted/40 border-b border-border/60">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-foreground py-3 px-3 sm:px-4 min-w-[180px]">
                    Title
                  </TableHead>
                  <TableHead className="font-bold text-foreground py-3 px-2 sm:px-3 w-[100px] whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-foreground py-3 px-2 sm:px-3 w-[95px] whitespace-nowrap">
                    Duration
                  </TableHead>
                  <TableHead className="font-bold text-foreground py-3 px-2 sm:px-3 w-[85px] whitespace-nowrap">
                    Questions
                  </TableHead>
                  <TableHead className="font-bold text-foreground py-3 px-2 sm:px-3 w-[105px] whitespace-nowrap">
                    Created
                  </TableHead>
                  <TableHead className="text-right font-bold text-foreground py-3 px-3 sm:px-4 w-[130px] whitespace-nowrap">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {items.map((exam) => (
                  <TableRow key={exam.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="py-3.5 px-3 sm:px-4 min-w-[180px]">
                      <Link
                        href={`/teacher/exams/${exam.id}`}
                        className="font-heading font-bold text-sm sm:text-base text-foreground transition-colors hover:text-primary block line-clamp-1"
                      >
                        {exam.title}
                      </Link>
                      {exam.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                          {exam.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-2 sm:px-3 whitespace-nowrap">
                      <StatusBadge status={exam.status} />
                    </TableCell>
                    <TableCell className="py-3.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5 text-primary" />
                        <span>{exam.durationMinutes} min</span>
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                      {exam._count.examQuestions} Qs
                    </TableCell>
                    <TableCell className="py-3.5 px-2 sm:px-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(exam.createdAt))}
                    </TableCell>
                    <TableCell className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {exam.status === "PUBLISHED" && (
                          <ShareExamModal exam={exam} />
                        )}
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 sm:px-3 rounded-xl text-xs font-semibold shadow-2xs border-border/70 hover:bg-muted hover:text-foreground hover:border-primary/40 transition-all gap-1 cursor-pointer"
                        >
                          <Link href={`/teacher/exams/${exam.id}`}>
                            <span>Manage</span>
                            <ArrowRight className="size-3" />
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

