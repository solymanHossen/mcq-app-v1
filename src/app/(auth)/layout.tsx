import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Sparkles } from "lucide-react"
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
    <div className="flex min-h-svh flex-col bg-muted/30 text-foreground">
      {/* Full Header with brand logo & navigation for seamless UI/UX */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            title={`Go to ${APP_NAME} home`}
          >
            {settings?.logoUrl ? (
              <div className="relative size-9 sm:size-10 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card p-1 shadow-xs flex items-center justify-center">
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
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="size-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {APP_NAME}
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="h-10 sm:h-11 px-4 gap-2.5 text-base sm:text-[17px] font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/80 rounded-xl transition-colors"
            >
              <Link href="/">
                <ArrowLeft className="size-5 shrink-0" />
                <span>Back to home</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}