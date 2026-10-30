"use client"

import { useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn, getSession } from "next-auth/react"
import { roleHomePath } from "@/lib/auth.config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
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
    <Card className="w-full max-w-[420px] rounded-2xl border-border/80 bg-card p-6 sm:p-8 shadow-sm">
      <AuthHeader
        title="Sign in to ExamHub"
        description="Access your exams, question banks, and live results"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              Password has been reset! Please sign in with your new password.
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
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-base font-semibold text-foreground">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-primary hover:underline transition-colors"
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
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-base text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-foreground underline-offset-4 hover:underline hover:text-primary transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </form>
    </Card>
  )
}
