import { GraduationCap, LayoutDashboard, ClipboardList, BookOpen, CreditCard, Settings } from "lucide-react"
import { requireRole, TEACHER_ROLES } from "@/lib/authorization"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import type { SidebarNavItem } from "@/components/shared/sidebar-nav"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

const NAV_ITEMS: SidebarNavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
  { href: "/teacher/exams", label: "Exams", icon: <ClipboardList /> },
  { href: "/teacher/questions", label: "Question bank", icon: <BookOpen /> },
  { href: "/billing", label: "Billing", icon: <CreditCard /> },
  { href: "/teacher/settings", label: "Settings", icon: <Settings /> },
]

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const teacher = await requireRole(...TEACHER_ROLES)

  return (
    <DashboardShell
      icon={GraduationCap}
      badgeLabel="Teacher"
      mobileLabel="ExamHub Teacher"
      navItems={NAV_ITEMS}
      user={teacher}
    >
      {children}
    </DashboardShell>
  )
}
