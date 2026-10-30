import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/authorization"
import { writeFile, mkdir } from "node:fs/promises"
import path from "node:path"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: SUPER_ADMIN access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const mediaType = (formData.get("type") as string) || "media"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Size limit: 25MB for videos, 5MB for images
    const isVideo = file.type.startsWith("video/")
    const maxBytes = isVideo ? 25 * 1024 * 1024 : 5 * 1024 * 1024

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Max allowed: ${isVideo ? "25MB" : "5MB"}` },
        { status: 400 }
      )
    }

    // Sanitize extension
    const originalExt = path.extname(file.name).toLowerCase()
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".mp4", ".webm"]
    const ext = allowedExtensions.includes(originalExt) ? originalExt : isVideo ? ".mp4" : ".webp"

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const safePrefix = mediaType.replace(/[^a-zA-Z0-9_-]/g, "")
    const filename = `${safePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
    const filepath = path.join(uploadDir, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const publicUrl = `/uploads/${filename}`
    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error) {
    console.error("Admin upload failed:", error)
    return NextResponse.json({ error: "File upload failed" }, { status: 500 })
  }
}
