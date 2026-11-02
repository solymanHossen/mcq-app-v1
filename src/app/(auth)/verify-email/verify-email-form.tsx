"use client"

import { useActionState, useTransition, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { verifyEmailAction, resendOTPAction } from "@/modules/auth/actions"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { AuthHeader } from "@/components/auth/auth-header"
import { Spinner } from "@/components/ui/spinner"

export function VerifyEmailForm() {
  const email = useSearchParams().get("email") ?? ""
  const [otp, setOtp] = useState("")
  const [state, action, isPending] = useActionState(
    verifyEmailAction,
    undefined
  )
  const [resendPending, startResend] = useTransition()
  const [resendMsg, setResendMsg] = useState("")

  const handleResend = () => {
    startResend(async () => {
      const res = await resendOTPAction(email)
      setResendMsg(
        res.error ?? "New verification code has been sent to your email!"
      )
    })
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 sm:gap-8">
      <AuthHeader
        title="Verify your ExamHub account"
        description={
          email
            ? `Enter the 6-digit code sent to ${email} to activate your account`
            : "Enter the 6-digit verification code sent to your email"
        }
      />

      <Card className="gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <form action={action} aria-busy={isPending || resendPending}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="otp" value={otp} />

            <FieldGroup className="gap-5 sm:gap-6">
              {state?.error && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl border-destructive/30 shadow-xs"
                >
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
              {resendMsg && (
                <Alert>
                  <AlertDescription>{resendMsg}</AlertDescription>
                </Alert>
              )}

              <Field className="items-center py-2">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  aria-label="6-digit verification code"
                  containerClassName="w-full justify-center"
                >
                  <InputOTPGroup className="w-full max-w-sm gap-1.5 sm:gap-2">
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-11 min-w-0 flex-1 rounded-xl border border-input/60 bg-muted/20 text-base font-medium shadow-2xs first:rounded-xl last:rounded-xl data-[active=true]:border-primary/50 data-[active=true]:ring-4 data-[active=true]:ring-primary/15 sm:h-12"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </Field>

              <div className="flex flex-col gap-4 border-t border-border/60 pt-4 sm:pt-5">
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-xl font-bold shadow-md sm:h-13 sm:text-lg"
                  disabled={isPending || otp.length !== 6}
                >
                  {isPending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    "Verify account"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full whitespace-normal"
                  onClick={handleResend}
                  disabled={resendPending}
                >
                  {resendPending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Sending new code...</span>
                    </>
                  ) : (
                    "Didn't receive it? Resend code"
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
