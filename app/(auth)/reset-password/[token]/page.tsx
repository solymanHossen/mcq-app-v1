'use client';

import { useActionState } from 'react';
import { useParams } from 'next/navigation';
import { resetPasswordAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();

  // bind token to action so server action receives it
  const actionWithToken = resetPasswordAction.bind(null, token);
  const [state, action, isPending] = useActionState(actionWithToken, undefined);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>New password</CardTitle>
        <CardDescription>Choose a strong password</CardDescription>
      </CardHeader>

      <form action={action}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password"
              type="password" placeholder="Min 8 characters" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" name="confirmPassword"
              type="password" required />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full"
            disabled={isPending}>
            {isPending ? 'Updating...' : 'Set new password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}