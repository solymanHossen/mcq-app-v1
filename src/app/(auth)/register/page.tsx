"use client"

import { useActionState } from "react"
import Link from "next/link"
import { registerAction } from "@/modules/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"
import { Spinner } from "@/components/ui/spinner"
import { GraduationCap } from "lucide-react"

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, undefined)

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-8">
      <AuthHeader
        title="Join ExamHub"
        description="Start practicing, taking tests, and tracking performance"
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

              <Field>
                <FieldLabel
                  htmlFor="name"
                  className="text-xs font-semibold text-foreground sm:text-base"
                >
                  Full name
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  inputMode="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
              </Field>

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

              <Field>
                <FieldLabel
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground sm:text-base"
                >
                  Password
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
                      <span>Creating account...</span>
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <div className="space-y-2 text-center text-xs sm:text-sm">
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline py-1 inline-block"
                    >
                      Sign in
                    </Link>
                  </p>

                  <div className="pt-2 border-t border-border/40">
                    <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-1.5">
                      <GraduationCap className="size-4 shrink-0 text-primary" />
                      <span>Are you an educator?</span>{" "}
                      <Link
                        href="/teachers/apply"
                        className="font-semibold text-primary underline-offset-4 transition-colors hover:underline py-0.5"
                      >
                        Apply as Faculty
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

