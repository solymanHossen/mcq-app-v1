"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Ticket,
  Receipt,
  ScrollText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/teachers", label: "Teacher verification", icon: GraduationCap, exact: false },
  { href: "/admin/subscriptions", label: "Plans", icon: CreditCard, exact: false },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket, exact: false },
  { href: "/admin/payments", label: "Payments", icon: Receipt, exact: false },
  { href: "/admin/audit-log", label: "Audit log", icon: ScrollText, exact: false },
] as const

export function AdminNav({
  variant = "sidebar",
  className,
}: {
  variant?: "sidebar" | "mobile"
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav className={className}>
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              variant === "sidebar"
                ? "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                : "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
              active &&
                (variant === "sidebar"
                  ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  : "border-primary/40 bg-primary/10 text-primary hover:text-primary")
            )}
          >
            <Icon className={variant === "sidebar" ? "size-4" : "size-3.5"} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
