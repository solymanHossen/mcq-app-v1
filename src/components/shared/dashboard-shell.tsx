import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Settings, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/shared/logout-button"
import {
  SidebarNav,
  type SidebarNavItem,
} from "@/components/shared/sidebar-nav"
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
 * compact header + horizontally-scrollable pill nav on mobile.
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
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Icon className="size-4" />
            </span>
            <span className="font-heading text-sm font-semibold tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <Badge variant="secondary" className="ml-auto">
            {badgeLabel}
          </Badge>
        </div>

        <SidebarNav
          items={navItems}
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3"
        />

        <div className="space-y-1 border-t p-3">
          <Link
            href="/profile"
            className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all hover:bg-muted active:scale-98"
            title="Manage profile & account settings"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary transition-transform group-hover:scale-105">
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Settings className="size-3.5 text-muted-foreground opacity-60 transition-transform group-hover:rotate-45 group-hover:opacity-100" />
          </Link>
          <div className="flex items-center justify-between pt-0.5">
            <Link
              href="/profile"
              className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <UserIcon className="size-3" />
              <span>Profile</span>
            </Link>
            <LogoutButton className="h-7 text-xs text-muted-foreground hover:text-destructive" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b p-3 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Icon className="size-3.5" />
            </span>
            <span className="font-heading text-sm font-semibold">
              {mobileLabel}
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/profile"
              className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
              title="Profile"
            >
              {initials(user.name)}
            </Link>
            <LogoutButton className="h-7 px-2 text-xs" />
          </div>
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
