import { cache } from "react"
import { prisma } from "@/lib/prisma"

// Separate from CurrentUser (lib/authorization.ts) on purpose: that type is
// re-fetched on every guarded request, so it only carries the fields guards
// actually need to check. These are display-only and used on one page.
export const getAccountOverview = cache(async (userId: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      createdAt: true,
      lastLoginAt: true,
      teacherVerificationNote: true,
    },
  })
})
