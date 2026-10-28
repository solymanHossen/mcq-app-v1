import Link from "next/link"
import { requireUser } from "@/lib/authorization"
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
import { ClipboardListIcon, Plus, Clock, Users, ArrowRight } from "lucide-react"
import { PagePagination } from "@/components/shared/page-pagination"
import { DebouncedSearchInput } from "@/components/shared/debounced-search-input"
import { cn } from "@/lib/utils"
import type { ExamStatus } from "@/prisma/generated/prisma/client"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
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

  const { items, total, page, pageCount } = await listExams({
    teacherId: user.id,
    status,
    page: params.page ? Number(params.page) : 1,
    search,
  })

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
            Authored Exams
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            <span className="font-semibold text-foreground">{total}</span> total exam{total === 1 ? "" : "s"}
            {search ? ` matching "${search}"` : ""} · Manage test schedules and publishing status.
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
        <div className="rounded-[28px] bg-card p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardListIcon className="size-8 text-primary" />
              </EmptyMedia>
              <EmptyTitle className="font-heading text-xl font-bold">
                No exams found
              </EmptyTitle>
              <EmptyDescription className="text-sm text-muted-foreground sm:text-base">
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
          <div className="overflow-hidden rounded-[28px] border-0 bg-card p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-4 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
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
