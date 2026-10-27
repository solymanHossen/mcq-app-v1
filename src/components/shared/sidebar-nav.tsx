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
                ? "flex items-center rounded-xl text-sm font-medium text-muted-foreground transition-all duration-200 [&_svg]:size-4 hover:bg-muted hover:text-foreground active:scale-[0.98]"
                : "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors [&_svg]:size-3.5 hover:text-foreground",
              variant === "sidebar" &&
                (collapsed
                  ? "justify-center p-2.5"
                  : "gap-2.5 px-3 py-2"),
              active &&
                (variant === "sidebar"
                  ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-semibold"
                  : "border-primary/40 bg-primary/10 text-primary hover:text-primary")
            )}
          >
            {icon}
            {!collapsed && <span>{label}</span>}
            {collapsed && <span className="sr-only">{label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
