import Link from "next/link"
import { connection } from "next/server"
import { BookOpen, FileCheck2, ClipboardList, AlertTriangle, Clock } from "lucide-react"
import { requireRole } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function TeacherDashboardPage() {
  const teacher = await requireRole("TEACHER", "ADMIN")

  // Live counts for a signed-in teacher, never a prerendered shell — same
  // reasoning as the admin dashboard (see its connection() call).
  await connection()

  const [totalExams, published, drafts, questionCount, openViolations] = await Promise.all([
    prisma.exam.count({ where: { teacherId: teacher.id } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "PUBLISHED" } }),
    prisma.exam.count({ where: { teacherId: teacher.id, status: "DRAFT" } }),
    prisma.question.count({ where: { teacherId: teacher.id } }),
    prisma.violationEvent.count({
      where: { reviewStatus: "OPEN", attempt: { exam: { teacherId: teacher.id } } },
    }),
  ])

  const stats = [
    { href: "/teacher/exams", label: "Total exams", value: totalExams, icon: ClipboardList, highlight: false },
    { href: "/teacher/exams", label: "Published", value: published, icon: FileCheck2, highlight: false },
    { href: "/teacher/questions", label: "Question bank", value: questionCount, icon: BookOpen, highlight: false },
    {
      href: "/teacher/exams",
      label: "Flagged attempts to review",
      value: openViolations,
      icon: AlertTriangle,
      highlight: openViolations > 0,
    },
  ] as const

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Teacher dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {drafts > 0
            ? `${drafts} draft exam${drafts === 1 ? "" : "s"} not yet published.`
            : "All your exams are published."}
        </p>
      </div>

      {teacher.role === "TEACHER" && teacher.teacherVerificationStatus !== "VERIFIED" && (
        <Alert variant={teacher.teacherVerificationStatus === "REJECTED" ? "destructive" : "default"}>
          <Clock />
          <AlertTitle>
            {teacher.teacherVerificationStatus === "REJECTED"
              ? "Verification was rejected"
              : "Verification pending"}
          </AlertTitle>
          <AlertDescription>
            {teacher.teacherVerificationStatus === "REJECTED"
              ? "You can keep drafting questions and exams, but publishing is disabled until an admin re-verifies your account."
              : "You can draft questions and exams freely — publishing unlocks once an admin verifies your account."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ href, label, value, icon: Icon, highlight }) => (
          <Link key={label} href={href}>
            <Card className="h-full gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
              <CardHeader>
                <span
                  className={`mb-2 flex size-9 items-center justify-center rounded-lg ${
                    highlight ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="size-4.5" />
                </span>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
