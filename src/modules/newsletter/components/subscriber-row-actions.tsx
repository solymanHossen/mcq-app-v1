"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Trash2, CheckCircle2, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toggleSubscriberStatusAction, deleteSubscriberAction } from "@/modules/newsletter/actions"
import type { NewsletterStatus } from "@/modules/newsletter/types"
import { cn } from "@/lib/utils"

export function SubscriberRowActions({
  subscriberId,
  email,
  status,
}: {
  subscriberId: string
  email: string
  status: NewsletterStatus
}) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isSubscribed = status === "SUBSCRIBED"

  const handleToggle = () => {
    const nextStatus: NewsletterStatus = isSubscribed ? "UNSUBSCRIBED" : "SUBSCRIBED"
    startTransition(async () => {
      const res = await toggleSubscriberStatusAction(subscriberId, nextStatus)
      if (res.success) {
        toast.success(
          nextStatus === "SUBSCRIBED"
            ? `Reactivated subscription for ${email}`
            : `Unsubscribed ${email}`
        )
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteSubscriberAction(subscriberId)
      if (res.success) {
        setDeleteOpen(false)
        toast.success(`Removed ${email} from subscribers`)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleToggle}
        className={cn(
          "h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer",
          isSubscribed
            ? "border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
        )}
        title={isSubscribed ? "Set to Unsubscribed" : "Reactivate Subscription"}
      >
        {isPending ? (
          <Spinner className="size-3.5" />
        ) : isSubscribed ? (
          <>
            <Ban className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Unsubscribe</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Reactivate</span>
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => setDeleteOpen(true)}
        className="h-8 sm:h-8.5 size-8 sm:size-8.5 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
        title="Delete subscriber"
        aria-label={`Delete subscriber ${email}`}
      >
        <Trash2 className="size-3.5" />
      </Button>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border/70 bg-card shadow-lg p-5 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              Delete Subscriber?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-foreground">{email}</strong> from the newsletter subscriber list? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2.5 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setDeleteOpen(false)}
              className="rounded-xl h-10 px-4 text-sm font-semibold border-border/70"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
              className="rounded-xl h-10 px-4 text-sm font-bold gap-2 cursor-pointer shadow-xs"
            >
              {isPending && <Spinner className="size-3.5" />}
              <span>Delete Subscriber</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
