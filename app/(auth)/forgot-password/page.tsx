'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, undefined);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter your email and we'll send a reset link
        </CardDescription>
      </CardHeader>

      <form action={action}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert>
              <AlertDescription>
                Check your email for a reset link.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email"
              type="email" placeholder="you@example.com" required />
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full"
            disabled={isPending}>
            {isPending ? 'Sending...' : 'Send reset link'}
          </Button>
          <Link href="/login"
            className="text-sm text-muted-foreground hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}