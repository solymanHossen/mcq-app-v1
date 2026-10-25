import { NextResponse, type NextRequest } from "next/server"
import { purgeExpiredViolationEvents } from "@/lib/anti-cheat/retention"

// Scheduled worker — see lib/anti-cheat/retention.ts for the retention
// policy this enforces (archived exams only, past the grace period, never
// while an appeal is pending).
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await purgeExpiredViolationEvents()
  return NextResponse.json(result)
}
