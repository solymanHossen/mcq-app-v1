"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { BookmarkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toggleBookmarkAction } from "@/actions/learning.actions"
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
    >
      {isPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <BookmarkIcon
          data-icon="inline-start"
          className={cn("size-3.5", bookmarked && "fill-current")}
        />
      )}
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  )
}
