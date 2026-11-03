import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, GraduationCap } from "lucide-react"
import { APP_NAME } from "@/lib/config"
import { BrandLogo } from "@/components/shared/brand-logo"
import { getSystemSettings } from "@/modules/settings/queries"
import { Button } from "@/components/ui/button"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSystemSettings().catch(() => null)

  return (
    <div className="flex min-h-svh min-w-0 flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-sidebar-border bg-sidebar/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-2.5 px-3.5 sm:h-20 sm:gap-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex min-w-0 items-center transition-opacity hover:opacity-90 focus-visible:outline-ring"
            title={`Go to ${APP_NAME} home`}
          >
            <BrandLogo logoUrl={settings?.logoUrl} className="h-8.5 sm:h-9.5 w-auto" priority />
          </Link>

          <nav
            aria-label="Home navigation"
            className="flex shrink-0 items-center gap-2"
          >
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-full border-border/70 bg-card px-2.5 text-xs font-semibold text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:text-foreground active:scale-95 sm:h-10 sm:gap-2 sm:px-3.5 sm:text-sm"
            >
              <Link href="/">
                <ArrowLeft data-icon="inline-start" className="size-3.5 sm:size-4" />
                <span className="hidden min-[380px]:inline">Back to home</span>
                <span className="min-[380px]:hidden">Home</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex w-full min-w-0 flex-1 items-start justify-center px-3.5 pt-4 pb-8 sm:px-6 sm:pt-8 sm:pb-14 lg:px-8 lg:pt-10 lg:pb-16">
        <div className="w-full max-w-xl min-w-0">{children}</div>
      </main>
    </div>
  )
}
