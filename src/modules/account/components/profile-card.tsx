"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Lock } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { updateProfileNameAction } from "@/modules/account/actions"

export function ProfileCard({
  name,
  email,
}: {
  name: string
  email: string
  role: string
  joinedAt: string
  lastLoginAt: string | null
}) {
  const [value, setValue] = useState(name)
  const [isPending, startTransition] = useTransition()
  const dirty = value.trim().length > 0 && value.trim() !== name

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const result = await updateProfileNameAction(value.trim())
      if ("error" in result) {
        toast.error(result.error)
      } else {
        toast.success("Profile updated successfully")
      }
    })
  }

  return (
    <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-none backdrop-blur-xl transition-all sm:p-8">
      <div>
        <div className="pb-6">
          <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
            Personal Information
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Display Name Input (Google-style, large, smooth) */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm"
              >
                Full Name
              </Label>
              <input
                id="name"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                minLength={2}
                maxLength={100}
                required
                placeholder="Your full name"
                className="h-13.5 w-full rounded-2xl border border-border/80 bg-background/80 px-4.5 text-base font-medium text-foreground transition-all duration-200 placeholder:text-muted-foreground/40 hover:border-foreground/30 focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 focus:outline-none sm:h-14 sm:px-5"
              />
            </div>

            {/* Email Address Input (Google-style, large, smooth, read-only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm"
                >
                  Email Address
                </Label>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Lock className="size-3.5" />
                  Immutable
                </span>
              </div>
              <input
                id="email"
                value={email}
                disabled
                readOnly
                className="h-13.5 w-full cursor-not-allowed rounded-2xl border border-border/60 bg-muted/30 px-4.5 font-medium text-muted-foreground select-all sm:h-14 sm:px-5"
              />
            </div>
          </div>

          {/* Seamless Integrated Footer Bar */}
          <div className="flex items-center justify-between border-t border-border/60 pt-6">
            <span className="text-xs font-medium text-muted-foreground">
              {dirty ? (
                <span className="font-semibold text-primary">Unsaved changes</span>
              ) : (
                "Up to date"
              )}
            </span>

            <Button
              type="submit"
              disabled={!dirty || isPending}
              className="h-11 rounded-xl px-7 text-sm font-semibold shadow-none transition-all active:scale-95 cursor-pointer sm:h-12"
            >
              {isPending && <Spinner data-icon="inline-start" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

