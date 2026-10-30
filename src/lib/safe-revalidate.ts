import { revalidatePath as nextRevalidatePath } from "next/cache"

// Cache revalidation is infrastructure, not the actual mutation — it must
// never be able to break the operation it's attached to. It also has no
// request/render context to revalidate against outside one (e.g. a direct
// function call in a test), where Next.js throws instead of no-op'ing.
export function safeRevalidatePath(path: string, type?: "layout" | "page") {
  try {
    if (type) {
      nextRevalidatePath(path, type)
    } else {
      nextRevalidatePath(path)
    }
  } catch {
    // no-op
  }
}
