"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Palette, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function SettingsNav() {
  const pathname = usePathname()

  const tabs = [
    {
      href: "/admin/settings",
      label: "Hero & Branding",
      icon: Palette,
      isActive: pathname === "/admin/settings",
    },
    {
      href: "/admin/settings/policies",
      label: "Policies & Billing",
      icon: ShieldCheck,
      isActive: pathname === "/admin/settings/policies",
    },
  ]

  return (
    <div className="w-full border-b border-border/60 pb-3 mb-6">
      <nav
        aria-label="Settings sub-pages"
        className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-muted/60 p-1.5 border border-border/60 shadow-2xs backdrop-blur-xl"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex h-9 sm:h-9.5 items-center justify-center gap-2 rounded-lg px-4 text-xs sm:text-sm font-medium transition-all duration-150 select-none",
                tab.isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
