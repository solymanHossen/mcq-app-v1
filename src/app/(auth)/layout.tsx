import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, GraduationCap } from "lucide-react"
import { APP_NAME } from "@/lib/config"
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
        <div className="mx-auto flex h-20 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2 rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-ring sm:gap-3"
            title={`Go to ${APP_NAME} home`}
          >
            {settings?.logoUrl ? (
              <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-card p-1 shadow-xs sm:size-10">
                <Image
                  src={settings.logoUrl}
                  alt={APP_NAME}
                  width={40}
                  height={40}
                  className="size-full object-contain"
                  unoptimized={
                    settings.logoUrl.startsWith("/uploads/") ||
                    settings.logoUrl.startsWith("http")
                  }
                />
              </div>
            ) : (
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform duration-200 group-hover:scale-105 sm:size-10">
                <GraduationCap className="size-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {APP_NAME}
              </span>
            </div>
          </Link>

          <nav
            aria-label="Home navigation"
            className="flex shrink-0 items-center gap-2"
          >
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 gap-1.5 rounded-full border-border/70 bg-card px-3 text-xs font-semibold text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:text-foreground sm:gap-2 sm:px-3.5 sm:text-sm"
            >
              <Link href="/">
                <ArrowLeft data-icon="inline-start" />
                <span>Back to home</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex w-full min-w-0 flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="w-full max-w-xl min-w-0">{children}</div>
      </main>
    </div>
  )
}
