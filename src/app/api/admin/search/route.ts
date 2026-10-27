import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, isAdminTier } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"

/**
 * World-Class Global Admin Search API:
 * Performs high-speed indexed search across Users, Exams, and Coupons.
 * Enforces admin tier authorization (ADMIN or SUPER_ADMIN).
 */
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim()

    const user = await getCurrentUser()
    if (!user || !isAdminTier(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    if (!q || q.length < 2) {
      return NextResponse.json({ users: [], exams: [], coupons: [] })
    }

    const [users, exams, coupons] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 6,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          teacherVerificationStatus: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.exam.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
        },
        take: 6,
        select: {
          id: true,
          title: true,
          status: true,
          totalMarks: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.coupon.findMany({
        where: {
          code: { contains: q, mode: "insensitive" },
        },
        take: 6,
        select: {
          id: true,
          code: true,
          discountType: true,
          discountValue: true,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return NextResponse.json({ users, exams, coupons })
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest?: string }).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error
    }
    console.error("Global admin search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}

