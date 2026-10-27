import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Search } from "lucide-react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { AppSidebar } from "@/components/shared/app-sidebar"
import type { SidebarNavItem } from "@/components/shared/sidebar-nav"
import { APP_NAME } from "@/lib/config"

/**
 * World-Class Official shadcn/ui Dashboard Shell:
 * Uses SidebarProvider, SidebarInset, and SidebarTrigger directly with full fidelity.
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
  user: { name: string; email: string }
  quickAction?: unknown
  breadcrumb?: string
  children: React.ReactNode
}) {
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
        {/* Top bar with official shadcn SidebarTrigger */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="size-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground" />
            <Separator orientation="vertical" className="mr-1 h-4" />
            <span className="font-heading text-sm font-bold tracking-tight text-foreground sm:text-base">
              {breadcrumb ?? `${badgeLabel} Workspace`}
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative mx-4 hidden max-w-sm flex-1 lg:block">
            <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search assessments, subjects, records... (⌘K)"
              className="h-9 rounded-xl border-border/60 bg-muted/30 pl-9.5 pr-8 text-xs focus-visible:bg-background focus-visible:ring-1"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-2.5 inline-flex h-4.5 select-none items-center gap-1 rounded border border-border/80 bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          {/* User profile quick trigger */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 shadow-2xs"
              title="View Profile"
            >
              <span className="size-2 rounded-full bg-emerald-500 shadow-xs" />
              <span>{user.name.split(" ")[0]}</span>
            </Link>
          </div>
        </header>

        {/* Full-width inner dashboard canvas */}
        <main className="flex-1 w-full min-w-0 p-6 sm:p-8 lg:p-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
