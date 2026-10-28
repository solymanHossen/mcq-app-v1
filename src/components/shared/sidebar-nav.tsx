"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type SidebarNavItem = {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
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
      {items.map(({ href, label, icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
              variant === "sidebar"
                ? "flex items-center rounded-lg text-sm font-medium transition-colors [&_svg]:size-4.5"
                : "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors [&_svg]:size-4",
              variant === "sidebar" &&
                (collapsed
                  ? "size-10 justify-center p-0 mx-auto"
                  : "h-10 gap-3 px-3.5"),
              active
                ? variant === "sidebar"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold [&_svg]:text-sidebar-accent-foreground"
                  : "border-primary bg-primary text-primary-foreground font-bold shadow-xs [&_svg]:text-primary-foreground"
                : variant === "sidebar"
                  ? "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground [&_svg]:text-sidebar-foreground/60"
                  : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {icon}
            {!collapsed && <span className="tracking-tight">{label}</span>}
            {collapsed && <span className="sr-only">{label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
