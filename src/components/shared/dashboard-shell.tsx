import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/shared/logout-button"
import { SidebarNav, type SidebarNavItem } from "@/components/shared/sidebar-nav"
import { APP_NAME } from "@/lib/config"

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

/**
 * The shared chrome for every signed-in area (admin/teacher/student): a
 * fixed sidebar with branding, nav, and an account footer on desktop, and a
 * compact header + horizontally-scrollable pill nav on mobile — no drawer
 * component exists in this project, so mobile gets a strip instead of an
 * off-canvas panel.
 */
export function DashboardShell({
  icon: Icon,
  badgeLabel,
  mobileLabel,
  navItems,
  user,
  children,
}: {
  icon: LucideIcon
  badgeLabel: string
  mobileLabel: string
  navItems: readonly SidebarNavItem[]
  user: { name: string; email: string }
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/30 md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">{APP_NAME}</span>
          <Badge variant="secondary" className="ml-auto">
            {badgeLabel}
          </Badge>
        </div>

        <SidebarNav items={navItems} className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" />

        <div className="border-t p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <LogoutButton className="w-full justify-start" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b p-3 md:hidden">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Icon className="size-3.5" />
          </span>
          <span className="font-heading text-sm font-semibold">{mobileLabel}</span>
          <LogoutButton className="ml-auto" />
        </header>
        <div className="border-b md:hidden">
          <SidebarNav
            items={navItems}
            variant="mobile"
            className="flex gap-1.5 overflow-x-auto p-2.5"
          />
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
