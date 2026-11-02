"use client"

import { cn } from "@/lib/utils"
import { useTransition } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Laptop, LogOut, ShieldCheck, Clock, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { signOutAllDevicesAction } from "@/modules/account/actions"

export function SessionsCard({ className }: { className?: string } = {}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await signOutAllDevicesAction()
      toast.success("All other active sessions revoked")
      await signOut({ callbackUrl: "/login?sessionsRevoked=true" })
    })
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden",
        className
      )}
    >
      {/* Master Reference Card Header */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-blue-500/20">
            <ShieldCheck className="size-4.5 sm:size-5.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
              Active Device Sessions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
              Connected browsers and authentication tokens
            </p>
          </div>
        </div>

        <Badge
          className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1 rounded-full text-xs font-semibold self-start sm:self-auto"
        >
          <CheckCircle2 className="size-3.5" />
          <span>Active Session</span>
        </Badge>
      </div>

      <div className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
        {/* Current Active Session Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-border/60 bg-muted/15 p-4 sm:p-4.5">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 shadow-2xs ring-1 ring-primary/20">
              <Laptop className="size-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-semibold text-foreground">
                  Current Web Session
                </span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Desktop / mobile browser session authenticated with JWT cookie security.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/15 p-3.5 sm:p-4 text-xs text-muted-foreground leading-relaxed">
          If you suspect unauthorized access or lost a device, clicking below will immediately invalidate all session tokens and require re-authentication.
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isPending}
            className="h-11 sm:h-12 px-6 rounded-xl font-bold border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-xs active:scale-95 w-full sm:w-auto"
          >
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <LogOut className="size-4 mr-2" />
            )}
            <span>Sign Out of All Devices</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
