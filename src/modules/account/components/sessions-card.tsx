"use client"

import { useTransition } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Laptop, LogOut, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { signOutAllDevicesAction } from "@/modules/account/actions"

export function SessionsCard() {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await signOutAllDevicesAction()
      toast.success("All other active sessions revoked")
      await signOut({ callbackUrl: "/login?sessionsRevoked=true" })
    })
  }

  return (
    <div className="relative flex flex-col justify-between rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all sm:p-8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div>
        <div className="flex items-center justify-between pb-6">
          <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">
            Active Device Sessions
          </h3>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-4.5" />
          </span>
        </div>

        <div className="space-y-4">
          {/* Current Active Session Card */}
          <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4.5 transition-all duration-200 hover:bg-muted/70">
            <div className="flex items-center gap-3.5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Laptop className="size-5" />
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Current Web Session
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Active Now
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Desktop / Mobile browser session authenticated via JWT token.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seamless Integrated Action Bar */}
        <div className="flex items-center justify-end pt-6 mt-6">
          <Button
            type="button"
            variant="destructive"
            onClick={handleClick}
            disabled={isPending}
            className="h-11 rounded-xl px-6 text-sm font-semibold shadow-none transition-all duration-200 active:scale-95 cursor-pointer sm:h-12"
          >
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <LogOut className="mr-2 size-4" />
            )}
            Sign Out of All Devices
          </Button>
        </div>
      </div>
    </div>
  )
}
