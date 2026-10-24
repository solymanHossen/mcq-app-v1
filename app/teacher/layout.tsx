import Link from "next/link"
import { requireRole } from "@/lib/auth/guards"
import { LogoutButton } from "@/components/logout-button"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("TEACHER", "ADMIN")

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b p-3">
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/teacher/exams" className="hover:underline">
            Exams
          </Link>
          <Link href="/teacher/questions" className="hover:underline">
            Question bank
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
