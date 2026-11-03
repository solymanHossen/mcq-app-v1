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

  const handleToggle = () => {
    const nextStatus: NewsletterStatus = status === "SUBSCRIBED" ? "UNSUBSCRIBED" : "SUBSCRIBED"
    startTransition(async () => {
      const res = await toggleSubscriberStatusAction(subscriberId, nextStatus)
      if (res.success) {
        toast.success(
          nextStatus === "SUBSCRIBED"
            ? `Subscribed ${email}`
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
        className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-border/70 shadow-2xs hover:bg-muted"
        title={status === "SUBSCRIBED" ? "Set to Unsubscribed" : "Reactivate Subscription"}
      >
        {isPending ? (
          <Spinner className="size-3.5" />
        ) : status === "SUBSCRIBED" ? (
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
        className="h-8 size-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        title="Delete subscriber"
        aria-label={`Delete subscriber ${email}`}
      >
        <Trash2 className="size-3.5" />
      </Button>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold">
              Delete Subscriber?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1.5">
              Are you sure you want to permanently delete <strong className="text-foreground">{email}</strong> from the newsletter subscriber list? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setDeleteOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
              className="rounded-xl gap-2"
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

