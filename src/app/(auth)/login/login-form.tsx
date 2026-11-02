"use client"

import { useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn, getSession } from "next-auth/react"
import { roleHomePath } from "@/lib/auth.config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"
import { Spinner } from "@/components/ui/spinner"

export function LoginForm() {
  const params = useSearchParams()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
        return
      }

      const session = await getSession()
      window.location.href = roleHomePath(session?.user?.role)
    })
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 sm:gap-8">
      <AuthHeader
        title="Sign in to ExamHub"
        description="Access your exams, question banks, and live results"
      />

      <Card className="gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <form onSubmit={handleSubmit} aria-busy={isPending}>
            <FieldGroup className="gap-5 sm:gap-6">
              {params.get("verified") && (
                <Alert>
                  <AlertDescription>
                    Email verified successfully! Please sign in.
                  </AlertDescription>
                </Alert>
              )}
              {params.get("registered") && (
                <Alert>
                  <AlertDescription>
                    Account created successfully! Please sign in.
                  </AlertDescription>
                </Alert>
              )}
              {params.get("reset") && (
                <Alert>
                  <AlertDescription>
                    Password has been reset! Please sign in with your new
                    password.
                  </AlertDescription>
                </Alert>
              )}
              {params.get("passwordChanged") && (
                <Alert>
                  <AlertDescription>
                    Password updated! Please sign in again.
                  </AlertDescription>
                </Alert>
              )}
              {params.get("sessionsRevoked") && (
                <Alert>
                  <AlertDescription>
                    Signed out of all devices. Please sign in again.
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl border-destructive/30 shadow-xs"
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground sm:text-base"
                >
                  Email address
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-semibold text-foreground sm:text-base"
                  >
                    Password
                  </FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-primary underline-offset-4 transition-colors hover:underline sm:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>

              <div className="flex flex-col gap-4 border-t border-border/60 pt-4 sm:pt-5">
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full rounded-xl font-bold shadow-md sm:h-13 sm:text-lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground sm:text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    Create account
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
