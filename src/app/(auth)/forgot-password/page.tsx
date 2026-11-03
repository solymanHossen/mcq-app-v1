"use client"

import { useActionState } from "react"
import Link from "next/link"
import { forgotPasswordAction } from "@/modules/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"
import { Spinner } from "@/components/ui/spinner"

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(
    forgotPasswordAction,
    undefined
  )

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-6">
      <AuthHeader
        title="Reset your password"
        description="Enter your email to recover your ExamHub account"
      />

      <Card className="gap-0 rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 py-0 shadow-xs sm:shadow-sm">
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <form action={action} aria-busy={isPending}>
            <FieldGroup className="gap-4 sm:gap-6">
              {state?.error && (
                <Alert
                  variant="destructive"
                  className="rounded-xl sm:rounded-2xl border-destructive/30 shadow-xs py-2.5 px-3 sm:p-4"
                >
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">{state.error}</AlertDescription>
                </Alert>
              )}
              {state?.success && (
                <Alert className="rounded-xl sm:rounded-2xl py-2.5 px-3 sm:p-4">
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                    Check your email for the reset link instructions.
                  </AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground sm:text-base"
                >
                  Email address
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <div className="flex flex-col gap-3.5 border-t border-border/60 pt-4 sm:gap-4 sm:pt-5">
                <Button
                  type="submit"
                  size="lg"
                  className="h-11.5 sm:h-13 w-full rounded-xl sm:rounded-2xl font-bold shadow-md text-sm sm:text-lg active:scale-[0.99] transition-all cursor-pointer"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground sm:text-sm">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline py-1 inline-block"
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
