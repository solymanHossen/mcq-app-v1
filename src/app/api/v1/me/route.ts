import type { NextRequest } from "next/server"
import { requireApiUser } from "@/modules/mobile/auth"
import { apiOk, handleApiError } from "@/modules/mobile/response"

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser(request)
    return apiOk({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teacherVerificationStatus: user.teacherVerificationStatus,
    })
  } catch (e) {
    return handleApiError(e)
  }
}
