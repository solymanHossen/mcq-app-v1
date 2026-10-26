"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Menu,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react"

import { APP_NAME } from "@/lib/config"
import { cn } from "@/lib/utils"

interface NavbarProps {
  className?: string
}

const NAV_LINKS = [
  { href: "/#features", label: "Features", icon: Sparkles },
  { href: "/#how-it-works", label: "How it works", icon: Zap },
  { href: "/teachers", label: "Teachers", icon: Users },
  { href: "/#enterprise", label: "Enterprise", icon: Building2 },
] as const

export function Navbar({ className }: NavbarProps) {
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

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        className
      )}
    >
      {/* Standard Container Wrapper */}
      <div className="container mx-auto px-4 sm:px-6 pt-3 sm:pt-5">
        <div
          className={cn(
            "relative flex h-16 sm:h-[68px] items-center justify-between rounded-2xl sm:rounded-[22px] border px-4 sm:px-7 transition-all duration-300",
            "border-border/80 bg-card/85 text-card-foreground backdrop-blur-2xl shadow-xs",
            scrolled && "shadow-md border-border bg-card/95 backdrop-blur-2xl"
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
            <span className="font-heading text-xl sm:text-[22px] font-bold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </Link>

          {/* Center: Bigger, Cleaner Navigation Links */}
          <nav className="hidden items-center gap-8 lg:gap-10 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[15.5px] lg:text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right: Clean Action Buttons */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/login"
              className="text-[15.5px] lg:text-base font-medium text-muted-foreground transition-colors hover:text-foreground px-2 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="group inline-flex h-11 sm:h-[46px] items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:shadow active:scale-95"
            >
              <span>Get started</span>
              <ArrowRight className="size-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-11 items-center justify-center rounded-xl border border-border/90 bg-muted/40 text-foreground transition-colors hover:bg-muted active:scale-95 md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* ================= WORLD-CLASS MOBILE MENU DRAWER ================= */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <div
              aria-hidden="true"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-0 z-40 bg-background/60 backdrop-blur-md md:hidden transition-opacity duration-300"
            />

            {/* Mobile Sheet Drawer */}
            <div
              role="dialog"
              aria-modal="true"
              className="relative mt-2 z-50 rounded-3xl border border-border/80 bg-card/98 text-card-foreground p-5 sm:p-6 backdrop-blur-2xl shadow-2xl md:hidden animate-in fade-in-0 zoom-in-95 duration-200"
            >
              <div className="flex flex-col gap-1.5">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted/70 active:bg-muted"
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

                {/* Mobile Auth Actions */}
                <div className="mt-4 pt-4 border-t border-border/70 flex flex-col gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-center rounded-xl border border-border bg-card text-base font-semibold text-foreground hover:bg-muted transition-colors shadow-xs active:scale-98"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-98"
                  >
                    <span>Get started free</span>
                    <ArrowRight className="size-4 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
