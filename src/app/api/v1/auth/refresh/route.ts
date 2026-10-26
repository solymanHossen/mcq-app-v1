import type { NextRequest } from "next/server"
import { refreshMobile } from "@/modules/mobile/auth-actions"
import { apiOk, handleApiError, readJsonBody } from "@/modules/mobile/response"

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request)
    const result = await refreshMobile(body, request.headers.get("user-agent") ?? undefined)
    return apiOk(result)
  } catch (e) {
    return handleApiError(e)
  }
}
