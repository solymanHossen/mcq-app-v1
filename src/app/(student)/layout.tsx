import { GraduationCap, LayoutDashboard, BookOpen, RotateCcw, TrendingUp, Trophy, CreditCard } from "lucide-react"
import { requireUser } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import type { SidebarNavItem } from "@/components/shared/sidebar-nav"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Deliberately requireUser(), not requireRole("STUDENT"): /dashboard lives
  // in this same group and is reachable by any authenticated role — it
  // redirects ADMIN/TEACHER onward to their own dashboards itself. Guarding
  // this layout with requireRole("STUDENT") would redirect a non-student
  // straight back to /dashboard, which is inside this very group — an
  // infinite loop. The other pages here (exams/mistakes/progress/leaderboard)
  // each already call requireRole("STUDENT") themselves.
  const user = await requireUser()
  const { billingEnabled } = await getSystemSettings()

  const navItems: SidebarNavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard />, exact: true },
    { href: "/exams", label: "Exams", icon: <BookOpen /> },
    { href: "/mistakes", label: "Mistake notebook", icon: <RotateCcw /> },
    { href: "/progress", label: "Progress", icon: <TrendingUp /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <Trophy /> },
    ...(billingEnabled
      ? [{ href: "/billing", label: "Billing", icon: <CreditCard /> }]
      : []),
  ]

  return (
    <DashboardShell
      icon={GraduationCap}
      badgeLabel="Student"
      mobileLabel="ExamHub"
      navItems={navItems}
      user={user}
    >
      {children}
    </DashboardShell>
  )
}
