import type { NextRequest } from "next/server"
import { getClientIp } from "@/modules/auth/ip"
import { loginMobile } from "@/modules/mobile/auth-actions"
import { apiOk, handleApiError, readJsonBody } from "@/modules/mobile/response"

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request)
    const result = await loginMobile(
      body,
      getClientIp(request.headers),
      request.headers.get("user-agent") ?? undefined
    )
    return apiOk(result)
  } catch (e) {
    return handleApiError(e)
  }
}
