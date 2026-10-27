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
                ? "flex items-center rounded-2xl text-[15px] font-medium transition-all duration-200 [&_svg]:size-5 active:scale-[0.98]"
                : "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors [&_svg]:size-4",
              variant === "sidebar" &&
                (collapsed
                  ? "size-12 justify-center p-0 mx-auto"
                  : "h-11.5 gap-3.5 px-4 py-3"),
              active
                ? variant === "sidebar"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm [&_svg]:text-primary-foreground hover:bg-primary/95 hover:text-primary-foreground"
                  : "border-primary bg-primary text-primary-foreground font-bold shadow-xs [&_svg]:text-primary-foreground"
                : variant === "sidebar"
                  ? "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
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
