"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type SidebarNavSubItem = {
  href: string
  label: string
  icon?: React.ReactNode
  exact?: boolean
}

export type SidebarNavItem = {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
  badge?: number | string | React.ReactNode
  items?: readonly SidebarNavSubItem[]
}

export function SidebarNav({
  items,
  variant = "sidebar",
  collapsed = false,
  className,
}: {
  items: readonly SidebarNavItem[]
  variant?: "sidebar" | "mobile"
  collapsed?: boolean
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav className={className}>
      {items.map(({ href, label, icon, exact, badge }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
              "relative overflow-hidden",
              variant === "sidebar"
                ? "flex items-center rounded-lg text-sm font-medium transition-colors [&_svg]:size-4.5"
                : "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors [&_svg]:size-4",
              variant === "sidebar" &&
                (collapsed
                  ? "size-10 justify-center p-0 mx-auto"
                  : "h-10 gap-3 px-3"),
              active
                ? variant === "sidebar"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "border-primary bg-primary text-primary-foreground font-bold shadow-xs [&_svg]:text-primary-foreground"
                : variant === "sidebar"
                  ? "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground [&_svg]:text-sidebar-foreground/60"
                  : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {icon}
            {!collapsed && <span className="tracking-tight">{label}</span>}
            {collapsed && <span className="sr-only">{label}</span>}
            {!collapsed && badge !== undefined && badge !== null && (
              <span
                className={cn(
                  "ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10.5px] font-bold tabular-nums transition-colors shrink-0",
                  typeof badge === "number" && badge > 0
                    ? active
                      ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-2xs"
                    : typeof badge === "number" && badge === 0
                    ? "bg-muted text-muted-foreground/80 border border-border/50"
                    : "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                {badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
