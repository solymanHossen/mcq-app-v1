"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Menu, Sparkles, X } from "lucide-react"

import { APP_NAME } from "@/lib/config"
import { cn } from "@/lib/utils"

interface NavbarProps {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        className
      )}
    >
      {/* Inner Container */}
      <div className="container mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
        <div
          className={cn(
            "relative flex h-14 sm:h-[58px] items-center justify-between rounded-2xl border px-4 sm:px-6 transition-all duration-300",
            "border-border/80 bg-card/90 text-card-foreground backdrop-blur-xl shadow-xs",
            scrolled && "shadow-md border-border bg-card/95"
          )}
        >
          {/* Left: Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-95"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-xs transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="size-4.5" />
            </span>
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-[14.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-[14.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#audiences"
              className="text-[14.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Teachers &amp; students
            </a>
            <a
              href="#enterprise"
              className="text-[14.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Enterprise
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="hidden items-center gap-5 md:flex">
            <Link
              href="/login"
              className="text-[14.5px] font-medium text-muted-foreground transition-colors hover:text-foreground px-1 py-1"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="group inline-flex h-9 sm:h-[38px] items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 px-4 sm:px-5 text-[14px] font-semibold text-primary-foreground shadow-xs transition-all duration-200 hover:shadow-sm active:scale-95"
            >
              <span>Get started</span>
              <ArrowRight className="size-3.5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/50 text-foreground transition-colors hover:bg-muted md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mt-2 rounded-2xl border border-border/90 bg-card/95 text-card-foreground p-5 backdrop-blur-2xl shadow-xl md:hidden">
            <div className="flex flex-col gap-3.5">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                How it works
              </a>
              <a
                href="#audiences"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Teachers &amp; students
              </a>
              <a
                href="#enterprise"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Enterprise
              </a>

              <div className="mt-2 pt-3 border-t border-border/60 flex flex-col gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-border bg-muted/40 py-2 text-center text-sm font-medium text-foreground hover:bg-muted"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-xs"
                >
                  <span>Get started</span>
                  <ArrowRight className="size-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
