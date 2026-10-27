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
    <div className="relative flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all sm:p-8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div>
        <div className="pb-6">
          <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
            Personal Information
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Display Name Input (Teacher Directory style, soft bg, smooth focus, no hard border) */}
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
                className="h-13.5 w-full rounded-2xl bg-muted/30 px-5 text-base font-medium text-foreground transition-all placeholder:text-muted-foreground/50 hover:bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/25 focus:outline-none sm:h-14"
              />
            </div>

            {/* Email Address Input (Teacher Directory style, read-only) */}
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
                className="h-13.5 w-full cursor-not-allowed rounded-2xl bg-muted/20 px-5 font-medium text-muted-foreground select-all sm:h-14"
              />
            </div>
          </div>

          {/* Seamless Integrated Footer Bar */}
          <div className="flex items-center justify-between border-t border-border/50 pt-6">
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
              className="h-11 rounded-xl px-7 text-sm font-bold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all cursor-pointer sm:h-12"
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

