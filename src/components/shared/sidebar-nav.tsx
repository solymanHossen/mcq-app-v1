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
                ? "flex items-center rounded-xl text-sm font-medium transition-colors [&_svg]:size-4.5"
                : "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors [&_svg]:size-4",
              variant === "sidebar" &&
                (collapsed
                  ? "size-10 justify-center p-0 mx-auto"
                  : "h-11 gap-3 pl-3.5 pr-3"),
              active
                ? variant === "sidebar"
                  ? "bg-gradient-to-r from-primary/15 via-primary/8 to-primary/3 text-primary font-semibold border border-primary/20 shadow-xs shadow-primary/10 [&_svg]:text-primary [&_svg]:drop-shadow-[0_1px_2px_rgba(14,165,233,0.35)]"
                  : "border-primary bg-primary text-primary-foreground font-bold shadow-xs [&_svg]:text-primary-foreground"
                : variant === "sidebar"
                  ? "border border-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground [&_svg]:text-sidebar-foreground/60"
                  : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {active && variant === "sidebar" && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-gradient-to-b from-sky-400 via-primary to-blue-600 shadow-[0_0_10px_rgba(14,165,233,0.55)] dark:from-sky-300 dark:via-sky-400 dark:to-blue-500 dark:shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-all duration-200"
              />
            )}
            {icon}
            {!collapsed && <span className="tracking-tight">{label}</span>}
            {collapsed && <span className="sr-only">{label}</span>}
            {!collapsed && badge !== undefined && badge !== null && (
              <span
                className={cn(
                  "ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10.5px] font-bold tabular-nums transition-colors shrink-0",
                  typeof badge === "number" && badge > 0
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-2xs"
                    : typeof badge === "number" && badge === 0
                    ? "bg-muted text-muted-foreground/80 border border-border/50"
                    : "bg-primary/15 text-primary border border-primary/25"
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
