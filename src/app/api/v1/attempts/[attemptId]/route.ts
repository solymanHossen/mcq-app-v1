import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError } from "@/modules/mobile/response"
import { getAttemptForStudent } from "@/modules/attempts/queries"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, "STUDENT")
    const { attemptId } = await params

    const owner = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: { studentId: true },
    })
    if (!owner) return apiError(404, "Attempt not found")
    if (owner.studentId !== user.id) return apiError(403, "Not your attempt")

    const attempt = await getAttemptForStudent(attemptId)
    return apiOk({ attempt })
  } catch (e) {
    return handleApiError(e)
  }
}
