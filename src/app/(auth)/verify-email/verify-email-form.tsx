"use client"

import { useActionState, useTransition, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { verifyEmailAction, resendOTPAction } from "@/modules/auth/actions"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
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
      setResendMsg(res.error ?? "New verification code has been sent to your email!")
    })
  }

  return (
    <Card className="w-full max-w-[420px] rounded-2xl border-border/80 bg-card p-6 sm:p-8 shadow-sm">
      <AuthHeader
        title="Verify your ExamHub account"
        description={
          email
            ? `Enter the 6-digit code sent to ${email} to activate your account`
            : "Enter the 6-digit verification code sent to your email"
        }
      />

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={otp} />

        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        {resendMsg && (
          <Alert>
            <AlertDescription>{resendMsg}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center justify-center py-2">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full text-base sm:text-lg font-semibold shadow-xs"
            disabled={isPending || otp.length !== 6}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2" />
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
            className="w-full text-base font-medium"
            onClick={handleResend}
            disabled={resendPending}
          >
            {resendPending ? (
              <>
                <Spinner className="mr-2" />
                <span>Sending new code...</span>
              </>
            ) : (
              "Didn't receive it? Resend code"
            )}
          </Button>

          <p className="text-center text-base text-muted-foreground pt-1">
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
