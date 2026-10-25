'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, undefined);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start your journey today</CardDescription>
      </CardHeader>

      <form action={action}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name"
              placeholder="John Doe" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email"
              type="email" placeholder="you@example.com" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password"
              type="password" placeholder="Min 8 characters" required />
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full"
            disabled={isPending}>
            {isPending ? 'Creating...' : 'Create account'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Have an account?{' '}
            <Link href="/login" className="underline">Sign in</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}