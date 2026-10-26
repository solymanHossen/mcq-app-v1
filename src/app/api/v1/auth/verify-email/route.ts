import type { NextRequest } from "next/server"
import { verifyEmailMobile } from "@/modules/mobile/auth-actions"
import { apiOk, handleApiError, readJsonBody } from "@/modules/mobile/response"

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request)
    const result = await verifyEmailMobile(body)
    return apiOk(result)
  } catch (e) {
    return handleApiError(e)
  }
}
