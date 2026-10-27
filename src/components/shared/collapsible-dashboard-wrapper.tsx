"use client"

import * as React from "react"
import Link from "next/link"
import { PanelLeft, Search, Menu, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CollapsibleDashboardWrapperProps {
  breadcrumb: string
  userName: string
  userEmail: string
  quickAction?: {
    label: string
    href: string
  }
  desktopBrand: React.ReactNode
  desktopBrandCollapsed: React.ReactNode
  desktopQuickAction?: React.ReactNode
  desktopQuickActionCollapsed?: React.ReactNode
  desktopNav: React.ReactNode
  desktopNavCollapsed: React.ReactNode
  desktopFooter: React.ReactNode
  desktopFooterCollapsed: React.ReactNode
  mobileBrand: React.ReactNode
  mobileNav: React.ReactNode
  mobileQuickAction?: React.ReactNode
  mobileFooter: React.ReactNode
  children: React.ReactNode
}

export function CollapsibleDashboardWrapper({
  breadcrumb,
  userName,
  userEmail,
  quickAction,
  desktopBrand,
  desktopBrandCollapsed,
  desktopQuickAction,
  desktopQuickActionCollapsed,
  desktopNav,
  desktopNavCollapsed,
  desktopFooter,
  desktopFooterCollapsed,
  mobileBrand,
  mobileNav,
  mobileQuickAction,
  mobileFooter,
  children,
}: CollapsibleDashboardWrapperProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Keyboard shortcut (Cmd+B or Ctrl+B) to toggle sidebar
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault()
        setCollapsed((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex min-h-svh bg-background">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMobileOpen(false)
          }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          aria-label="Close menu"
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/80 bg-card p-4 transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          {mobileBrand}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="size-8 rounded-lg"
            title="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        {mobileQuickAction && (
          <div className="pt-3" onClick={() => setMobileOpen(false)}>
            {mobileQuickAction}
          </div>
        )}

        <div
          className="flex flex-1 flex-col gap-1 overflow-y-auto pt-3"
          onClick={() => setMobileOpen(false)}
        >
          {mobileNav}
        </div>

        <div className="border-t border-border/60 pt-3">{mobileFooter}</div>
      </aside>

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border/80 bg-sidebar/50 backdrop-blur-md transition-all duration-300 ease-in-out md:flex",
          collapsed ? "w-18" : "w-64"
        )}
      >
        {/* Brand Header */}
        {collapsed ? desktopBrandCollapsed : desktopBrand}

        {/* Quick Action Button */}
        {collapsed ? desktopQuickActionCollapsed : desktopQuickAction}

        {/* Navigation list */}
        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
          {collapsed ? desktopNavCollapsed : desktopNav}
        </div>

        {/* User profile footer */}
        <div className="border-t border-border/60 p-2.5">
          {collapsed ? desktopFooterCollapsed : desktopFooter}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Top Header */}
        <header className="flex h-14 items-center gap-2 border-b border-border/60 px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="size-8.5 rounded-lg"
            title="Open menu"
          >
            <Menu className="size-4" />
          </Button>
          {mobileBrand}
        </header>

        {/* Desktop Interactive Top Bar with WORKING TOGGLE BUTTON */}
        <div className="hidden h-14 items-center justify-between border-b border-border/60 px-6 sm:px-8 md:flex">
          <div className="flex items-center gap-2.5">
            {/* The Interactive Sidebar Trigger */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((prev) => !prev)}
              className="size-8.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
              title={collapsed ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"}
            >
              <PanelLeft className="size-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>

            <span className="text-xs text-muted-foreground/30">|</span>

            {/* Breadcrumb Label */}
            <span className="font-heading text-xs font-semibold text-foreground tracking-tight sm:text-sm">
              {breadcrumb}
            </span>
          </div>

          {/* Search Input Bar (Matching Profile Page and Large Enterprise Apps) */}
          <div className="relative mx-4 hidden max-w-sm flex-1 lg:block">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search assessments, subjects, records... (⌘K)"
              className="h-8.5 rounded-xl border-border/60 bg-muted/30 pl-8.5 pr-8 text-xs focus-visible:bg-background focus-visible:ring-1"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-2 inline-flex h-4.5 select-none items-center gap-1 rounded border border-border/80 bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {quickAction && (
              <Button
                asChild
                size="sm"
                className="h-8 rounded-lg px-3 text-xs font-semibold shadow-2xs"
              >
                <Link href={quickAction.href}>
                  <Plus className="mr-1 size-3.5" />
                  <span>{quickAction.label}</span>
                </Link>
              </Button>
            )}

            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70"
              title="View Profile"
            >
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>{userName.split(" ")[0]}</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
