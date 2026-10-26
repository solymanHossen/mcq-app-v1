import Link from "next/link"
import { APP_NAME } from "@/lib/config"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground sm:flex-row text-center sm:text-left">
        <span>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/#features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/teachers" className="hover:text-foreground transition-colors">
            Teacher List
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-foreground transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    </footer>
  )
}
