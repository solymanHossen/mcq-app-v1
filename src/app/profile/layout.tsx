import * as React from "react"

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { requireUser } from "@/lib/authorization"

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

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-background text-foreground">
      {/* Exact Same Public Route Header Navbar (Floating Pill on Desktop, Flush Edge-to-Edge on Mobile) */}
      <Navbar user={user} />

      {/* Dynamic Ambient Background Glows matching the Landing Hero Section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 -z-10 size-[36rem] rounded-full bg-primary/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-20 -z-10 size-[32rem] rounded-full bg-chart-2/10 blur-[140px]"
      />

      {/* Main Content Area — Elegantly spaced below the floating header (same as the Hero section) */}
      <main className="flex-1 pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 xl:max-w-7xl">
          {children}
        </div>
      </main>

      {/* Unified World-Class Footer */}
      <Footer />
    </div>
  )
}
