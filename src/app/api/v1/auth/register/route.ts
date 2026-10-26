import type { NextRequest } from "next/server"
import { getClientIp } from "@/modules/auth/ip"
import { registerMobile } from "@/modules/mobile/auth-actions"
import { apiOk, handleApiError, readJsonBody } from "@/modules/mobile/response"

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request)
    const result = await registerMobile(body, getClientIp(request.headers))
    return apiOk(result, 201)
  } catch (e) {
    return handleApiError(e)
  }
}
