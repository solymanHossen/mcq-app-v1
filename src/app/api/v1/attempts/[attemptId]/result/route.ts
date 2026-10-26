import type { NextRequest } from "next/server"
import { requireApiUser, requireApiRole } from "@/modules/mobile/auth"
import { apiOk, apiError, handleApiError } from "@/modules/mobile/response"
import { getResultForStudent } from "@/modules/grading/queries"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await requireApiUser(request)
    requireApiRole(user, "STUDENT")
    const { attemptId } = await params

    const result = await getResultForStudent(attemptId)
    if (!result) return apiError(404, "Attempt not found")
    if (result.studentId !== user.id) return apiError(403, "Not your attempt")

    return apiOk({ result })
  } catch (e) {
    return handleApiError(e)
  }
}
