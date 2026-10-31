"use client"

import { useActionState } from "react"
import Link from "next/link"
import { resetPasswordAction } from "@/modules/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"
import { Spinner } from "@/components/ui/spinner"

export function ResetPasswordForm({ token }: { token: string }) {
  // bind token to action so server action receives it
  const actionWithToken = resetPasswordAction.bind(null, token)
  const [state, action, isPending] = useActionState(actionWithToken, undefined)

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 sm:gap-8">
      <AuthHeader
        title="Create new password"
        description="Choose a strong password for your ExamHub account"
      />

      <Card className="gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <form action={action} aria-busy={isPending}>
            <FieldGroup className="gap-5 sm:gap-6">
              {state?.error && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl border-destructive/30 shadow-xs"
                >
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              <Field className="gap-2">
                <FieldLabel
                  htmlFor="password"
                  className="text-sm font-semibold text-foreground sm:text-base"
                >
                  New password
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  required
                />
              </Field>

              <Field className="gap-2">
                <FieldLabel
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-foreground sm:text-base"
                >
                  Confirm new password
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </Field>

              <div className="flex flex-col gap-4 border-t border-border/60 pt-4 sm:pt-5">
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-xl font-bold shadow-md sm:h-13 sm:text-lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    "Save new password"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground sm:text-sm">
                  <Link
                    href="/login"
                    className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    Back to sign in
                  </Link>
                </p>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
