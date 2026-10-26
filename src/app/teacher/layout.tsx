import { GraduationCap, LayoutDashboard, ClipboardList, BookOpen, CreditCard, Settings } from "lucide-react"
import { requireRole, TEACHER_ROLES } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import type { SidebarNavItem } from "@/components/shared/sidebar-nav"
import { APP_NAME } from "@/lib/config"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const teacher = await requireRole(...TEACHER_ROLES)
  const { billingEnabled } = await getSystemSettings()

  const navItems: SidebarNavItem[] = [
    { href: "/teacher", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
    { href: "/teacher/exams", label: "Exams", icon: <ClipboardList /> },
    { href: "/teacher/questions", label: "Question bank", icon: <BookOpen /> },
    ...(billingEnabled
      ? [{ href: "/billing", label: "Billing", icon: <CreditCard /> }]
      : []),
    { href: "/teacher/settings", label: "Settings", icon: <Settings /> },
  ]

  return (
    <DashboardShell
      icon={GraduationCap}
      badgeLabel="Teacher"
      mobileLabel={`${APP_NAME} Teacher`}
      navItems={navItems}
      user={teacher}
    >
      {children}
    </DashboardShell>
  )
}
