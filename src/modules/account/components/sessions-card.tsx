"use client"

import { useTransition } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
      toast.success("Signed out everywhere")
      await signOut({ callbackUrl: "/login?sessionsRevoked=true" })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Don&apos;t recognize a login? Sign out of every device at once — including this one —
          and sign back in with your password.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <Button variant="destructive" onClick={handleClick} disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          Sign out of all devices
        </Button>
      </CardFooter>
    </Card>
  )
}
