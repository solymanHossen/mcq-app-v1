import Link from "next/link"
import { Sparkles } from "lucide-react"
import { SwaggerUIClient } from "./swagger-ui-client"

export const metadata = { title: "API docs — ExamHub" }

export default function ApiDocsPage() {
  return (
    <div className="min-h-svh bg-white">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-heading text-base font-semibold tracking-tight text-foreground">
              ExamHub API
            </span>
          </Link>
          <span className="text-sm text-muted-foreground">v1</span>
        </div>
      </header>

      <SwaggerUIClient />
    </div>
  )
}
