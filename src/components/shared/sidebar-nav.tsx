"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type SidebarNavItem = {
  href: string
  label: string
  // A rendered element (e.g. `<Users />`), not the icon's component type —
  // this is a Client Component, and a Server Component layout can hand it
  // an already-rendered element to display, but not a bare function to call
  // (React Flight can't serialize an arbitrary component reference across
  // the server/client boundary, only resolved output). Left unsized here
  // (no `size-*` class) so the sidebar/mobile variants below can size it
  // via `[&_svg]:size-*` on the ancestor link.
  icon: React.ReactNode
  exact?: boolean
}

export function SidebarNav({
  items,
  variant = "sidebar",
  className,
}: {
  items: readonly SidebarNavItem[]
  variant?: "sidebar" | "mobile"
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
            className={cn(
              variant === "sidebar"
                ? "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors [&_svg]:size-4 hover:bg-muted hover:text-foreground"
                : "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors [&_svg]:size-3.5 hover:text-foreground",
              active &&
                (variant === "sidebar"
                  ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  : "border-primary/40 bg-primary/10 text-primary hover:text-primary")
            )}
          >
            {icon}
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
