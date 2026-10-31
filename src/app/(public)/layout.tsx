import * as React from "react"
import { connection } from "next/server"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { getCurrentUser } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Resolve visitor sessions at request time rather than during prerendering.
  await connection()

  const [user, settings] = await Promise.all([
    getCurrentUser(),
    getSystemSettings(),
  ])

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar user={user} logoUrl={settings.logoUrl} />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer logoUrl={settings.logoUrl} />
    </div>
  )
}
