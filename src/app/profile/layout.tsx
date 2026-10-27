import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles, LayoutDashboard } from "lucide-react"

import { requireUser } from "@/lib/authorization"
import { APP_NAME } from "@/lib/config"
import { UserNav } from "@/components/shared/user-nav"
import { roleHomePath } from "@/lib/auth.config"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  const homePath = roleHomePath(user.role)

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Sparkles className="size-4" />
              </span>
              <span className="font-heading text-lg font-bold tracking-tight">
                {APP_NAME}
              </span>
            </Link>

            <span className="hidden h-5 w-px bg-border sm:block" />

            <Link
              href={homePath}
              className="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <UserNav user={user} showDashboardButton={false} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
