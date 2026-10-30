'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/modules/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { AuthHeader } from '@/components/auth/auth-header';
import { Spinner } from '@/components/ui/spinner';

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, undefined);

  return (
    <Card className="w-full max-w-[420px] rounded-2xl border-border/80 bg-card p-6 sm:p-8 shadow-sm">
      <AuthHeader
        title="Reset your password"
        description="Enter your email to recover your ExamHub account"
      />

      <form action={action} className="flex flex-col gap-4">
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        {state?.success && (
          <Alert>
            <AlertDescription>
              Check your email for the reset link instructions.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-base font-semibold text-foreground">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
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
                <span>Sending link...</span>
              </>
            ) : (
              'Send reset link'
            )}
          </Button>

          <p className="text-center text-base text-muted-foreground">
            Remember your password?{' '}
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
  );
}