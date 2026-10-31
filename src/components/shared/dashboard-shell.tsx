import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
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
  user: { name: string; email: string; role?: Role; id?: string; isGuest?: boolean }
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
        {/* Modern Master Reference Header: h-16, clean border, subtle backdrop blur */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          {/* Left section: Trigger, Separator, Workspace Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <SidebarTrigger className="size-8.5 rounded-lg border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground cursor-pointer shadow-2xs" />
            <Separator orientation="vertical" className="h-4 bg-border/60" />
            <span className="font-heading text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
              {breadcrumb ?? `${badgeLabel} Workspace`}
            </span>
          </div>

          {/* Center section: World-Class Interactive Spotlight Search Trigger */}
          <div className="hidden md:flex flex-1 justify-center max-w-md lg:max-w-lg mx-auto px-4">
            <GlobalSearchTrigger />
          </div>

          {/* Right section: Mobile Search Icon, Theme Toggle, User Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
                isGuest: user.isGuest,
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
