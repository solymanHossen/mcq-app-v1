import Link from "next/link"
import { connection } from "next/server"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react"
import { requireRole, TEACHER_ROLES } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { ProfileHero } from "@/modules/account/components/profile-hero"
import { VerificationStatusCard } from "@/modules/account/components/verification-status-card"
import { cn } from "@/lib/utils"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata = {
  title: "Teacher Dashboard",
  description:
    "Author assessments, manage questions, inspect student attempts, and review academic performance.",
}

export default async function TeacherDashboardPage() {
  const teacher = await requireRole(...TEACHER_ROLES)

  // Live counts for a signed-in teacher, never a prerendered shell — same
  // reasoning as the admin dashboard (see its connection() call).
  await connection()

  const [
    teacherUser,
    totalExams,
    published,
    drafts,
    archived,
    questionCount,
    openViolations,
    totalAttempts,
    recentExams,
    subjects,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: teacher.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        isEmailVerified: true,
        teacherVerificationStatus: true,
        teacherVerificationNote: true,
      },
    }),
    prisma.exam.count({ where: { teacherId: teacher.id } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "PUBLISHED" } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "DRAFT" } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "ARCHIVED" } }),
    prisma.question.count({ where: { teacherId: teacher.id } }),
    prisma.violationEvent.count({
      where: { reviewStatus: "OPEN", attempt: { exam: { teacherId: teacher.id } } },
    }),
    prisma.examAttempt.count({
      where: { exam: { teacherId: teacher.id } },
    }),
    prisma.exam.findMany({
      where: { teacherId: teacher.id },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        durationMinutes: true,
        createdAt: true,
        _count: {
          select: {
            attempts: true,
            examQuestions: true,
          },
        },
      },
    }),
    prisma.question.findMany({
      where: { teacherId: teacher.id },
      select: { subject: true },
      distinct: ["subject"],
    }),
  ])

  const heroUser = {
    id: teacherUser.id,
    name: teacherUser.name,
    email: teacherUser.email,
    role: teacherUser.role,
    isEmailVerified: teacherUser.isEmailVerified,
    createdAt: teacherUser.createdAt,
    lastLoginAt: teacherUser.lastLoginAt,
    teacherVerificationStatus: teacherUser.teacherVerificationStatus,
    teacherTotalAttempts: totalAttempts,
    _count: {
      exams: totalExams,
      questions: questionCount,
    },
  }

  return (
    <div className="space-y-8">
      {/* ================= HERO BANNER (MATCHING PROFILE PAGE HERO) ================= */}
      <ProfileHero user={heroUser} />

      {/* ================= VERIFICATION ACCREDITATION NOTICE ================= */}
      {teacherUser.role === "TEACHER" &&
        teacherUser.teacherVerificationStatus !== "VERIFIED" && (
          <VerificationStatusCard
            status={teacherUser.teacherVerificationStatus}
            note={teacherUser.teacherVerificationNote}
          />
        )}

      {/* ================= QUICK EDUCATOR ACTION HUB ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <Link
          href="/teacher/exams/new"
          className="group flex items-center justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99] sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16">
              <Plus className="size-7 sm:size-8" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Create Exam
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Author new timed assessment
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>

        <Link
          href="/teacher/questions/new"
          className="group flex items-center justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99] sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16 dark:bg-indigo-500/15 dark:text-indigo-400">
              <BookOpen className="size-7 sm:size-8" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Add Questions
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Expand question bank vault
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>

        <Link
          href="/teacher/exams"
          className="group flex items-center justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99] sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Users className="size-7 sm:size-8" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Cohorts &amp; Results
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Review student submissions
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
        </Link>
      </div>

      {/* ================= SCULPTED 4-TILE KPI METRICS SYSTEM ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {/* Tile 1: Total Exams */}
        <Link href="/teacher/exams" className="block group">
          <div className="flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                Total Exams
              </span>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <FileSpreadsheet className="size-5" />
              </span>
            </div>
            <div className="mt-4">
              <p className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {totalExams}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {published} published · {drafts} draft{drafts === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </Link>

        {/* Tile 2: Question Vault */}
        <Link href="/teacher/questions" className="block group">
          <div className="flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                Question Bank
              </span>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-500/15 dark:text-indigo-400">
                <BookOpen className="size-5" />
              </span>
            </div>
            <div className="mt-4">
              <p className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {questionCount}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                Across {subjects.length} academic subject{subjects.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </Link>

        {/* Tile 3: Student Submissions */}
        <Link href="/teacher/exams" className="block group">
          <div className="flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                Student Takers
              </span>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Users className="size-5" />
              </span>
            </div>
            <div className="mt-4">
              <p className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {totalAttempts}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                Submissions recorded across exams
              </p>
            </div>
          </div>
        </Link>

        {/* Tile 4: Flagged Proctored Attempts */}
        <Link href="/teacher/exams" className="block group">
          <div
            className={cn(
              "flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]",
              openViolations > 0 && "ring-1 ring-amber-500/30"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                Flagged Attempts
              </span>
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
                  openViolations > 0
                    ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                    : "bg-muted/60 text-muted-foreground"
                )}
              >
                <AlertTriangle className="size-5" />
              </span>
            </div>
            <div className="mt-4">
              <p
                className={cn(
                  "font-heading text-3xl font-black tracking-tight sm:text-4xl",
                  openViolations > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-foreground"
                )}
              >
                {openViolations}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {openViolations > 0
                  ? "Requires academic integrity review"
                  : "All attempts clear & regular"}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* ================= ACADEMIC SUBJECT DISCIPLINES ================= */}
      {subjects.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
            Authored Academic Disciplines
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {subjects.map((item) => (
              <span
                key={item.subject}
                className="inline-flex items-center gap-1.5 rounded-xl bg-muted/60 px-3.5 py-1.5 text-xs font-semibold text-foreground/90 transition-colors hover:bg-muted/90 sm:px-4 sm:py-2 sm:text-sm"
              >
                <BookOpen className="size-3.5 text-primary" />
                <span>{item.subject}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ================= RECENT AUTHORED EXAMS SHOWCASE ================= */}
      <Card className="rounded-[28px] border-0 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <CardHeader className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                Recent Authored Exams
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground sm:text-base">
                Your examination tracks, scheduled durations, question counts, and student cohort participation.
              </CardDescription>
            </div>
            <Button
              asChild
              variant="secondary"
              className="self-start rounded-xl text-xs font-semibold sm:self-auto sm:text-sm"
            >
              <Link href="/teacher/exams">
                <span>Manage all exams</span>
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
          {recentExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <BookOpenCheck className="size-7" />
              </div>
              <p className="text-lg font-bold text-foreground">
                No exams created yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Start authoring assessments to publish tests to students and review their performance here.
              </p>
              <Button
                asChild
                className="mt-6 rounded-xl px-6 text-sm font-semibold shadow-xs"
              >
                <Link href="/teacher/exams/new">Create First Exam</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentExams.map((exam) => (
                <div
                  key={exam.id}
                  className="group flex flex-col justify-between gap-4 rounded-2xl bg-muted/40 p-5 transition-all duration-200 hover:bg-muted/60 sm:p-6"
                >
                  <div className="min-w-0 space-y-2.5">
                    <div className="flex items-start justify-between gap-2.5">
                      <h4 className="font-heading text-base font-bold text-foreground transition-colors group-hover:text-primary line-clamp-1 sm:text-lg">
                        {exam.title}
                      </h4>
                      <Badge
                        variant={
                          exam.status === "PUBLISHED"
                            ? "default"
                            : exam.status === "DRAFT"
                              ? "secondary"
                              : "outline"
                        }
                        className="shrink-0 rounded-lg text-[11px] font-semibold"
                      >
                        {exam.status === "PUBLISHED"
                          ? "Published"
                          : exam.status === "DRAFT"
                            ? "Draft"
                            : "Archived"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Clock className="size-3.5 text-primary" />
                        <span>{exam.durationMinutes} min</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <BookOpen className="size-3.5" />
                        <span>{exam._count.examQuestions} Qs</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Users className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{exam._count.attempts} takers</span>
                      </span>
                    </div>

                    {exam.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(exam.createdAt))}
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-xl text-xs font-semibold shadow-2xs hover:border-primary/40"
                    >
                      <Link href={`/teacher/exams/${exam.id}`}>
                        <span>Manage Exam</span>
                        <ArrowRight className="ml-1 size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

