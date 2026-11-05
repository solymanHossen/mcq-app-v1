"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"
import { Spinner } from "@/components/ui/spinner"
import { APP_NAME } from "@/lib/config"

export function LoginForm() {
  const router = useRouter()
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

      // The dashboard resolves pending applications and approvals from the DB.
      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-6">
      <AuthHeader
        title={`Sign in to ${APP_NAME}`}
        description="Access your exams, question banks, and live results"
      />

      <Card className="gap-0 rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 py-0 shadow-xs sm:shadow-sm">
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <form onSubmit={handleSubmit} aria-busy={isPending}>
            <FieldGroup className="gap-4 sm:gap-6">
              {params.get("verified") && (
                <Alert className="rounded-xl sm:rounded-2xl py-2.5 px-3 sm:p-4">
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                    Email verified successfully! Please sign in.
                  </AlertDescription>
                </Alert>
              )}
              {params.get("registered") && (
                <Alert className="rounded-xl sm:rounded-2xl py-2.5 px-3 sm:p-4">
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                    Account created successfully! Please sign in.
                  </AlertDescription>
                </Alert>
              )}
              {params.get("reset") && (
                <Alert className="rounded-xl sm:rounded-2xl py-2.5 px-3 sm:p-4">
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                    Password has been reset! Please sign in with your new
                    password.
                  </AlertDescription>
                </Alert>
              )}
              {params.get("passwordChanged") && (
                <Alert className="rounded-xl sm:rounded-2xl py-2.5 px-3 sm:p-4">
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                    Password updated! Please sign in again.
                  </AlertDescription>
                </Alert>
              )}
              {params.get("sessionsRevoked") && (
                <Alert className="rounded-xl sm:rounded-2xl py-2.5 px-3 sm:p-4">
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">
                    Signed out of all devices. Please sign in again.
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-xl sm:rounded-2xl border-destructive/30 shadow-xs py-2.5 px-3 sm:p-4"
                >
                  <AlertDescription className="text-xs sm:text-sm leading-relaxed">{error}</AlertDescription>
                </Alert>
              )}

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
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field>
                <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                  <FieldLabel
                    htmlFor="password"
                    className="text-xs font-semibold text-foreground sm:text-base"
                  >
                    Password
                  </FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-primary underline-offset-4 transition-colors hover:underline active:opacity-75 py-0.5 sm:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                    className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline py-1 inline-block"
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
