"use client"

import { useActionState } from "react"
import Link from "next/link"
import { resetPasswordAction } from "@/modules/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"
import { Spinner } from "@/components/ui/spinner"

export function ResetPasswordForm({ token }: { token: string }) {
  // bind token to action so server action receives it
  const actionWithToken = resetPasswordAction.bind(null, token)
  const [state, action, isPending] = useActionState(actionWithToken, undefined)

  return (
    <Card className="w-full max-w-[420px] rounded-2xl border-border/80 bg-card p-6 sm:p-8 shadow-sm">
      <AuthHeader
        title="Create new password"
        description="Choose a strong password for your ExamHub account"
      />

      <form action={action} className="flex flex-col gap-4">
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-base font-semibold text-foreground">
            New password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Min 8 characters"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword" className="text-base font-semibold text-foreground">
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full text-base sm:text-lg font-semibold shadow-xs"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
                <span>Updating password...</span>
              </>
            ) : (
              "Save new password"
            )}
          </Button>

          <p className="text-center text-base text-muted-foreground">
            <Link
              href="/login"
              className="font-semibold text-foreground underline-offset-4 hover:underline hover:text-primary transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </form>
    </Card>
  )
}
