import { NextResponse, type NextRequest } from "next/server"
import { sweepExpiredAttempts } from "@/lib/attempts/expire"

// Scheduled worker (e.g. Vercel Cron, or any external scheduler) hits this
// on an interval to promptly flip expired attempts to TIMEOUT. It's a
// promptness optimization only — finalizeIfExpired() in every attempt
// action already makes the system correct even if this endpoint is never
// called, or fails silently for a while.
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await sweepExpiredAttempts()
  return NextResponse.json(result)
}
