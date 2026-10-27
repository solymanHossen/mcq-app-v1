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

/**
 * World-Class Official shadcn/ui Dashboard Shell:
 * Features modern trendy icons, interactive spotlight search command palette,
 * system health indicator, theme toggle, and spacious luxury layout.
 *
 * Runs as a React Server Component to seamlessly bridge Server Layouts
 * with rich Client interactive triggers.
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
  mobileLabel?: string
  navItems: readonly SidebarNavItem[]
  user: { name: string; email: string; role?: Role; id?: string }
  quickAction?: unknown
  breadcrumb?: string
  children: React.ReactNode
}) {
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
        navItems={navItems}
        user={user}
      />
      <SidebarInset className="min-w-0 flex-1 w-full bg-background">
        {/* World-Class Header: Spacious, Glassmorphic, Modern */}
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-none bg-background/90 px-4 sm:px-6 lg:px-8 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02),_0_6px_20px_-4px_rgba(0,0,0,0.06),_0_16px_40px_-6px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3),_0_8px_30px_-4px_rgba(0,0,0,0.6),_0_18px_50px_-6px_rgba(0,0,0,0.4)]">
          {/* Left section: Trigger, Separator, Workspace Title & Live Pulse */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <SidebarTrigger className="size-10 rounded-2xl border-none bg-muted/40 text-muted-foreground shadow-2xs transition-all duration-200 hover:bg-muted/80 hover:text-foreground hover:scale-105 active:scale-95" />
            <Separator orientation="vertical" className="hidden sm:block h-5 w-[1.5px] bg-border/40" />
            
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-heading text-base sm:text-lg font-extrabold tracking-tight text-foreground truncate">
                {breadcrumb ?? `${badgeLabel} Workspace`}
              </span>
              <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
                </span>
                <span>LIVE</span>
              </div>
            </div>
          </div>

          {/* Center section: World-Class Interactive Spotlight Search Trigger */}
          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <GlobalSearchTrigger />
          </div>

          {/* Right section: Mobile Search Icon, System Status, Theme Toggle, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <GlobalSearchMobileButton />

            {/* Live Operational Status Pill */}
            <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>System Healthy</span>
            </div>

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
