import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Plus, Settings, User as UserIcon, PanelLeft } from "lucide-react"
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

export interface DashboardQuickAction {
  label: string
  href: string
  icon?: LucideIcon
}

/**
 * The shared chrome for every signed-in area (admin/teacher/student): a
 * fixed sidebar with branding, quick create action, nav, and an account footer on desktop,
 * and a compact header + horizontally-scrollable pill nav on mobile.
 */
export function DashboardShell({
  icon: Icon,
  badgeLabel,
  mobileLabel,
  navItems,
  user,
  quickAction,
  breadcrumb,
  children,
}: {
  icon: LucideIcon
  badgeLabel: string
  mobileLabel: string
  navItems: readonly SidebarNavItem[]
  user: { name: string; email: string }
  quickAction?: DashboardQuickAction
  breadcrumb?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/80 bg-sidebar/50 backdrop-blur-md md:flex">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <span className="flex size-7.5 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
              <Icon className="size-4" />
            </span>
            <span className="font-heading text-sm font-bold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </Link>
          <Badge
            variant="secondary"
            className="ml-auto rounded-md px-2 py-0.5 text-[11px] font-semibold"
          >
            {badgeLabel}
          </Badge>
        </div>

        {/* Prominent Quick Action Button matching Acme reference */}
        {quickAction && (
          <div className="px-3 pt-3 pb-1">
            <Link
              href={quickAction.href}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
            >
              {quickAction.icon ? (
                <quickAction.icon className="size-3.5" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>{quickAction.label}</span>
            </Link>
          </div>
        )}

        {/* Navigation list */}
        <SidebarNav
          items={navItems}
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3"
        />

        {/* User profile footer */}
        <div className="border-t border-border/60 p-3">
          <Link
            href="/profile"
            className="group flex items-center gap-2.5 rounded-xl border border-transparent p-2 transition-all hover:border-border/60 hover:bg-card hover:shadow-2xs active:scale-[0.99]"
            title="Manage profile & account settings"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary transition-transform group-hover:scale-105">
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Settings className="size-3.5 text-muted-foreground opacity-60 transition-transform group-hover:rotate-45 group-hover:opacity-100" />
          </Link>
          <div className="mt-1 flex items-center justify-between px-1">
            <Link
              href="/profile"
              className="inline-flex h-6 items-center gap-1.5 rounded-md px-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <UserIcon className="size-3" />
              <span>Profile</span>
            </Link>
            <LogoutButton className="h-6 text-[11px] text-muted-foreground hover:text-destructive" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex items-center gap-2 border-b border-border/60 p-3 md:hidden">
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
        <div className="border-b border-border/60 md:hidden">
          <SidebarNav
            items={navItems}
            variant="mobile"
            className="flex gap-1.5 overflow-x-auto p-2.5"
          />
        </div>

        {/* Desktop Top Sub-Bar with Breadcrumb matching reference screenshot */}
        <div className="hidden h-14 items-center gap-2 border-b border-border/60 px-6 sm:px-8 md:flex">
          <PanelLeft className="size-4 text-muted-foreground/70" />
          <span className="text-xs text-muted-foreground/40">|</span>
          <span className="text-xs font-medium text-muted-foreground">
            {breadcrumb ?? `${badgeLabel} Dashboard`}
          </span>
        </div>

        <main className="flex-1 p-5 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
