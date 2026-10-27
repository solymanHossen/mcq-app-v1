"use client"

import { useTransition } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Laptop, LogOut, ShieldCheck } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
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
    <Card className="rounded-[24px] border border-border/80 shadow-xs transition-all duration-300 hover:shadow-md">
      <CardHeader className="space-y-1.5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-lg font-bold text-foreground sm:text-xl">
              Active Device Sessions
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground sm:text-[13px]">
              Monitor signed-in devices and revoke sessions immediately if
              unrecognized activity occurs.
            </CardDescription>
          </div>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-4.5" />
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Active Session Card */}
        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-muted/30 p-4">
          <div className="flex items-center gap-3.5">
            <span className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-2xs">
              <Laptop className="size-5 text-primary" />
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Current Web Session
                </span>
                <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  Active Now
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Desktop / Mobile browser session authenticated via JWT token.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          If you believe your account was accessed on an untrusted public
          computer, you can revoke all tokens at once. You will be required to
          re-authenticate with your password.
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-end border-t border-border/60 pt-5">
        <Button
          type="button"
          variant="destructive"
          onClick={handleClick}
          disabled={isPending}
          className="h-11 rounded-xl px-5 text-sm font-semibold shadow-xs transition-all duration-200 active:scale-95"
        >
          {isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <LogOut className="mr-2 size-4" />
          )}
          Sign Out of All Devices
        </Button>
      </CardFooter>
    </Card>
  )
}
