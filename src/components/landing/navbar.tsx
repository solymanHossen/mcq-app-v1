"use client"

import * as React from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  ArrowRight,
  Building2,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  User as UserIcon,
  Users,
  X,
  Zap,
} from "lucide-react"

import { APP_NAME } from "@/lib/config"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/shared/user-nav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { roleHomePath } from "@/lib/auth.config"
import type { Role } from "@/prisma/generated/prisma/client"

export interface NavbarUser {
  id?: string
  name: string
  email: string
  role: Role
}

interface NavbarProps {
  user?: NavbarUser | null
  className?: string
}

const NAV_LINKS = [
  { href: "/#features", label: "Features", icon: Sparkles },
  { href: "/#how-it-works", label: "How it works", icon: Zap },
  { href: "/teachers", label: "Teachers", icon: Users },
  { href: "/#enterprise", label: "Enterprise", icon: Building2 },
] as const

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function Navbar({ user, className }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  // Track scroll state for enhanced elevation
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll and handle escape key when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false)
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = ""
        window.removeEventListener("keydown", handleKeyDown)
      }
    } else {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const homePath = user ? roleHomePath(user.role) : "/login"

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        className
      )}
    >
      {/* Standard Container Wrapper */}
      <div className="container mx-auto px-4 pt-3 sm:px-6 sm:pt-5">
        <div
          className={cn(
            "relative flex h-16 items-center justify-between rounded-2xl border px-4 transition-all duration-300 sm:h-[68px] sm:rounded-[22px] sm:px-7",
            "border-border/80 bg-card/85 text-card-foreground shadow-xs backdrop-blur-2xl",
            scrolled && "border-border bg-card/95 shadow-md backdrop-blur-2xl"
          )}
        >
          {/* Left: Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-95"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background shadow-xs transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="size-5" />
            </span>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-[22px]">
              {APP_NAME}
            </span>
          </Link>

          {/* Center: Bigger, Cleaner Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex lg:gap-10">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[15.5px] font-medium text-muted-foreground transition-colors hover:text-foreground lg:text-base"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right: Actions (Dynamic when Logged In vs Logged Out) */}
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <UserNav user={user} showDashboardButton={true} />
            ) : (
              <div className="flex items-center gap-5">
                <Link
                  href="/login"
                  className="px-2 py-1.5 text-[15.5px] font-medium text-muted-foreground transition-colors hover:text-foreground lg:text-base"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow active:scale-95 sm:h-[46px]"
                >
                  <span>Get started</span>
                  <ArrowRight className="size-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-11 items-center justify-center rounded-xl border border-border/90 bg-muted/40 text-foreground transition-colors hover:bg-muted active:scale-95 md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {/* ================= WORLD-CLASS MOBILE MENU DRAWER ================= */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <div
              aria-hidden="true"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-0 z-40 bg-background/60 backdrop-blur-md transition-opacity duration-300 md:hidden"
            />

            {/* Mobile Sheet Drawer */}
            <div
              role="dialog"
              aria-modal="true"
              className="relative z-50 mt-2 max-h-[85vh] animate-in overflow-y-auto rounded-3xl border border-border/80 bg-card/98 p-5 text-card-foreground shadow-2xl backdrop-blur-2xl duration-200 fade-in-0 zoom-in-95 sm:p-6 md:hidden"
            >
              {/* If Logged In: Prominent User Header Card */}
              {user && (
                <div className="mb-4 rounded-2xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 border-2 border-primary/20 shadow-xs">
                      <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-base font-semibold text-foreground">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                      <div className="mt-1">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold tracking-wider uppercase"
                        >
                          {user.role.replace("_", " ").toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 grid grid-cols-2 gap-2">
                    <Link
                      href={homePath}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-xs transition-transform active:scale-95"
                    >
                      <LayoutDashboard className="size-3.5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground transition-colors hover:bg-muted active:scale-95"
                    >
                      <UserIcon className="size-3.5 text-emerald-500" />
                      <span>Profile</span>
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted/70 active:bg-muted"
                  >
                    <span className="flex items-center gap-3.5">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="size-4.5" />
                      </span>
                      <span>{label}</span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </a>
                ))}

                {/* Mobile Auth Actions or Sign Out */}
                <div className="mt-4 flex flex-col gap-2.5 border-t border-border/70 pt-4">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 text-base font-semibold text-destructive shadow-xs transition-colors hover:bg-destructive/20 active:scale-98"
                    >
                      <LogOut className="size-4" />
                      <span>Log out</span>
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex h-12 items-center justify-center rounded-xl border border-border bg-card text-base font-semibold text-foreground shadow-xs transition-colors hover:bg-muted active:scale-98"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-98"
                      >
                        <span>Get started free</span>
                        <ArrowRight className="size-4 stroke-[2.5]" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
