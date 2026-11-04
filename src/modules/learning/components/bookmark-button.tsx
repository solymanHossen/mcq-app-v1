"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { BookmarkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toggleBookmarkAction } from "@/modules/learning/actions"
import { cn } from "@/lib/utils"

export function BookmarkButton({
  examQuestionId,
  initialBookmarked,
}: {
  examQuestionId: string
  initialBookmarked: boolean
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const result = await toggleBookmarkAction({ examQuestionId })
      if (result && "error" in result) {
        toast.error(result.error)
        return
      }
      if (result?.success) setBookmarked(result.bookmarked)
    })
  }

  return (
    <Button
      type="button"
      variant={bookmarked ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={bookmarked}
      className={cn(
        "h-8 sm:h-8.5 px-3 rounded-xl text-xs font-semibold shadow-2xs transition-all gap-1.5 cursor-pointer",
        bookmarked
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-border/70 hover:border-primary/40 hover:text-primary"
      )}
    >
      {isPending ? (
        <Spinner className="size-3.5" />
      ) : (
        <BookmarkIcon
          className={cn("size-3.5", bookmarked && "fill-current")}
        />
      )}
      <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
    </Button>
  )
}
