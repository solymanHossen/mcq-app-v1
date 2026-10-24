'use client';

import { useActionState, useTransition, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmailAction, resendOTPAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  InputOTP, InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';

export default function VerifyEmailPage() {
  const email = useSearchParams().get('email') ?? '';
  const [otp, setOtp] = useState('');
  const [state, action, isPending] = useActionState(verifyEmailAction, undefined);
  const [resendPending, startResend] = useTransition();
  const [resendMsg, setResendMsg] = useState('');

  const handleResend = () => {
    startResend(async () => {
      const res = await resendOTPAction(email);
      setResendMsg(res.error ?? 'New OTP sent!');
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>We sent a 6-digit code to {email}</CardDescription>
      </CardHeader>

      <form action={action}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={otp} />

        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {resendMsg && (
            <Alert><AlertDescription>{resendMsg}</AlertDescription></Alert>
          )}

          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full"
            disabled={isPending || otp.length !== 6}>
            {isPending ? 'Verifying...' : 'Verify email'}
          </Button>
          <Button type="button" variant="ghost"
            className="w-full text-sm"
            onClick={handleResend} disabled={resendPending}>
            {resendPending ? 'Sending...' : "Didn't get it? Resend"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}