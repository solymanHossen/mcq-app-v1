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
import { APP_NAME } from "@/lib/config"

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
    <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-6">
      <AuthHeader
        title={`Verify your ${APP_NAME} account`}
        description={
          email
            ? `Enter the 6-digit code sent to ${email} to activate your account`
            : "Enter the 6-digit verification code sent to your email"
        }
      />

      <Card className="gap-0 rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 py-0 shadow-xs sm:shadow-sm">
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <form action={action} aria-busy={isPending || resendPending}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="otp" value={otp} />

            <FieldGroup className="gap-4 sm:gap-6">
              {state?.error && (
                <Alert
                  variant="destructive"
                  className="rounded-xl sm:rounded-2xl border-destructive/30 shadow-xs py-2.5 px-3 sm:p-4"
                >
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">{state.error}</AlertDescription>
                </Alert>
              )}
              {resendMsg && (
                <Alert className="rounded-xl sm:rounded-2xl py-2.5 px-3 sm:p-4">
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">{resendMsg}</AlertDescription>
                </Alert>
              )}

              <Field className="items-center py-1 sm:py-2">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  aria-label="6-digit verification code"
                  containerClassName="w-full justify-center"
                >
                  <InputOTPGroup className="w-full max-w-xs sm:max-w-sm gap-1 sm:gap-2 justify-center">
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="size-10 xs:size-11 sm:size-12 min-w-0 flex-1 rounded-lg sm:rounded-xl border border-input/60 bg-muted/20 text-base sm:text-lg font-bold shadow-2xs first:rounded-lg first:sm:rounded-xl last:rounded-lg last:sm:rounded-xl data-[active=true]:border-primary/50 data-[active=true]:ring-4 data-[active=true]:ring-primary/15"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </Field>

              <div className="flex flex-col gap-3.5 border-t border-border/60 pt-4 sm:gap-4 sm:pt-5">
                <Button
                  type="submit"
                  size="lg"
                  className="h-11.5 sm:h-13 w-full rounded-xl sm:rounded-2xl font-bold shadow-md text-sm sm:text-lg active:scale-[0.99] transition-all cursor-pointer"
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
                  size="sm"
                  className="h-10 sm:h-11 w-full text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground active:bg-muted/60 transition-colors whitespace-normal rounded-xl cursor-pointer"
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
