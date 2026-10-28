import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { UserNav } from "@/components/shared/user-nav"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import {
  GlobalSearchTrigger,
  GlobalSearchMobileButton,
  GlobalSearchDialog,
} from "@/components/shared/global-search-dialog"
import type { SidebarNavItem } from "@/components/shared/sidebar-nav"
import type { Role } from "@/prisma/generated/prisma/client"
import { APP_NAME } from "@/lib/config"

import { getSystemSettings } from "@/modules/settings/queries"

/**
 * World-Class Official shadcn/ui Dashboard Shell:
 * Features modern trendy icons, interactive spotlight search command palette,
 * system health indicator, theme toggle, and spacious luxury layout.
 *
 * Runs as a React Server Component to seamlessly bridge Server Layouts
 * with rich Client interactive triggers.
 */
export async function DashboardShell({
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
  mobileLabel?: string
  navItems: readonly SidebarNavItem[]
  user: { name: string; email: string; role?: Role; id?: string }
  quickAction?: unknown
  breadcrumb?: string
  children: React.ReactNode
}) {
  const settings = await getSystemSettings()
  const resolvedRole =
    user.role ??
    (badgeLabel.toUpperCase().includes("SUPER")
      ? "SUPER_ADMIN"
      : badgeLabel.toUpperCase().includes("ADMIN")
      ? "ADMIN"
      : badgeLabel.toUpperCase().includes("TEACHER")
      ? "TEACHER"
      : "STUDENT")

  return (
    <SidebarProvider>
      <AppSidebar
        brandIcon={<Icon className="size-4.5" />}
        brandName={APP_NAME}
        badgeLabel={badgeLabel}
        logoUrl={settings.logoUrl}
        navItems={navItems}
        user={user}
      />
      <SidebarInset className="min-w-0 flex-1 w-full bg-background">
        {/* World-Class Header: Clean border, unified with Sidebar, subtle backdrop blur */}
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar/95 backdrop-blur-md text-sidebar-foreground px-4 sm:px-6 lg:px-8">
          {/* Left section: Trigger, Separator, Workspace Title & Live Pulse */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <SidebarTrigger className="size-9 rounded-lg border-none bg-sidebar-accent/50 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground" />
            <span className="font-heading text-base sm:text-lg font-extrabold tracking-tight text-foreground truncate">
              {breadcrumb ?? `${badgeLabel} Workspace`}
            </span>
          </div>

          {/* Center section: World-Class Interactive Spotlight Search Trigger */}
          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <GlobalSearchTrigger />
          </div>

          {/* Right section: Mobile Search Icon, System Status, Theme Toggle, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <GlobalSearchMobileButton />


            {/* Quick Dark/Light Theme Toggle */}
            <ThemeToggle />

            {/* World-Class User Nav Profile with Dropdown & Sign Out */}
            <UserNav
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                role: resolvedRole as Role,
              }}
              showDashboardButton={false}
            />
          </div>
        </header>

        {/* Global Spotlight Search Dialog */}
        <GlobalSearchDialog />

        {/* Full-width inner dashboard canvas */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
