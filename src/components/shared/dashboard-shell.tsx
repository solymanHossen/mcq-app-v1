import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Settings, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/shared/logout-button"
import {
  SidebarNav,
  type SidebarNavItem,
} from "@/components/shared/sidebar-nav"
import { CollapsibleDashboardWrapper } from "@/components/shared/collapsible-dashboard-wrapper"
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
 * Server Component Chrome: accepts `icon: LucideIcon` safely from RSC layouts,
 * renders child elements on the server, and delegates interactive collapsible behavior
 * to `CollapsibleDashboardWrapper`.
 */
export function DashboardShell({
  icon: Icon,
  badgeLabel,
  mobileLabel,
  navItems,
  user,
  breadcrumb,
  children,
}: {
  icon: LucideIcon
  badgeLabel: string
  mobileLabel: string
  navItems: readonly SidebarNavItem[]
  user: { name: string; email: string }
  quickAction?: unknown
  breadcrumb?: string
  children: React.ReactNode
}) {
  const desktopBrand = (
    <div className="flex h-17 items-center gap-3 border-b border-border/60 px-5">
      <Link
        href="/"
        className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        title={APP_NAME}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs">
          <Icon className="size-4.5" />
        </span>
        <span className="font-heading text-base font-bold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      </Link>
      <Badge
        variant="secondary"
        className="ml-auto rounded-lg px-2.5 py-0.5 text-xs font-semibold"
      >
        {badgeLabel}
      </Badge>
    </div>
  )

  const desktopBrandCollapsed = (
    <div className="flex h-17 items-center justify-center border-b border-border/60 px-4">
      <Link
        href="/"
        className="flex items-center justify-center transition-opacity hover:opacity-90"
        title={APP_NAME}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs">
          <Icon className="size-4.5" />
        </span>
      </Link>
    </div>
  )

  const desktopFooter = (
    <div className="space-y-1.5">
      <Link
        href="/profile"
        className="group flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-all hover:border-border/60 hover:bg-card hover:shadow-2xs active:scale-[0.99]"
        title="Manage profile & account settings"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary transition-transform group-hover:scale-105">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
        <Settings className="size-4 text-muted-foreground opacity-60 transition-transform group-hover:rotate-45 group-hover:opacity-100" />
      </Link>
      <div className="flex items-center justify-between px-2">
        <Link
          href="/profile"
          className="inline-flex h-6 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <UserIcon className="size-3.5" />
          <span>Profile</span>
        </Link>
        <LogoutButton className="h-6 text-xs text-muted-foreground hover:text-destructive" />
      </div>
    </div>
  )

  const desktopFooterCollapsed = (
    <Link
      href="/profile"
      className="flex items-center justify-center rounded-2xl border border-transparent p-2 transition-all hover:border-border/60 hover:bg-card hover:shadow-2xs"
      title={`${user.name} (${user.email})`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary transition-transform hover:scale-105">
        {initials(user.name)}
      </span>
    </Link>
  )

  const mobileBrand = (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Icon className="size-4" />
      </span>
      <span className="font-heading text-sm font-bold">
        {mobileLabel}
      </span>
    </Link>
  )

  const mobileFooter = (
    <>
      <div className="flex items-center gap-3 p-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/profile"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Manage Profile
        </Link>
        <LogoutButton className="h-7 text-xs text-muted-foreground" />
      </div>
    </>
  )

  return (
    <CollapsibleDashboardWrapper
      breadcrumb={breadcrumb ?? `${badgeLabel} Workspace`}
      userName={user.name}
      userEmail={user.email}
      desktopBrand={desktopBrand}
      desktopBrandCollapsed={desktopBrandCollapsed}
      desktopNav={<SidebarNav items={navItems} collapsed={false} />}
      desktopNavCollapsed={<SidebarNav items={navItems} collapsed={true} />}
      desktopFooter={desktopFooter}
      desktopFooterCollapsed={desktopFooterCollapsed}
      mobileBrand={mobileBrand}
      mobileNav={<SidebarNav items={navItems} variant="sidebar" collapsed={false} />}
      mobileFooter={mobileFooter}
    >
      {children}
    </CollapsibleDashboardWrapper>
  )
}
