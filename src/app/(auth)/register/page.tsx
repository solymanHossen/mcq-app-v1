"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { registerAction } from "@/modules/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"
import { Spinner } from "@/components/ui/spinner"
import { GraduationCap, User, Building2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, undefined)
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT")

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 sm:gap-8">
      <AuthHeader
        title={role === "TEACHER" ? "Join as Faculty" : "Join ExamHub"}
        description={
          role === "TEACHER"
            ? "Create exams, manage question banks, and evaluate candidate performance"
            : "Start practicing, taking tests, and tracking performance"
        }
      />

      <Card className="gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <form action={action} aria-busy={isPending}>
            <input type="hidden" name="role" value={role} />

            <FieldGroup className="gap-5 sm:gap-6">
              {state?.error && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl border-destructive/30 shadow-xs"
                >
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              {/* Role Toggle */}
              <div className="space-y-2">
                <FieldLabel className="text-sm font-semibold text-foreground sm:text-base">
                  Account Type
                </FieldLabel>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/40 border border-border/60">
                  <button
                    type="button"
                    onClick={() => setRole("STUDENT")}
                    className={cn(
                      "py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer",
                      role === "STUDENT"
                        ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <User className="size-3.5 sm:size-4" />
                    <span>Student / Examinee</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("TEACHER")}
                    className={cn(
                      "py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer",
                      role === "TEACHER"
                        ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <GraduationCap className="size-3.5 sm:size-4" />
                    <span>Teacher / Faculty</span>
                  </button>
                </div>
              </div>

              <Field>
                <FieldLabel
                  htmlFor="name"
                  className="text-sm font-semibold text-foreground sm:text-base"
                >
                  Full name
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder={role === "TEACHER" ? "Prof. Jane Doe" : "John Doe"}
                  autoComplete="name"
                  required
                />
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground sm:text-base"
                >
                  {role === "TEACHER" ? "Academic / Official email" : "Email address"}
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={role === "TEACHER" ? "faculty@university.edu" : "you@example.com"}
                  autoComplete="email"
                  required
                />
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="password"
                  className="text-sm font-semibold text-foreground sm:text-base"
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

              {role === "TEACHER" && (
                <>
                  <Field>
                    <FieldLabel
                      htmlFor="institution"
                      className="text-sm font-semibold text-foreground sm:text-base flex items-center gap-1.5"
                    >
                      <Building2 className="size-3.5 text-primary" />
                      <span>Institution / University</span>
                    </FieldLabel>
                    <Input
                      id="institution"
                      name="institution"
                      placeholder="e.g. Dhaka University"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="department"
                      className="text-sm font-semibold text-foreground sm:text-base flex items-center gap-1.5"
                    >
                      <BookOpen className="size-3.5 text-primary" />
                      <span>Department / Subject</span>
                    </FieldLabel>
                    <Input
                      id="department"
                      name="department"
                      placeholder="e.g. Computer Science & Engineering"
                      required
                    />
                  </Field>

                  <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                    Faculty accounts are subject to administrative verification. You can draft exams immediately after signup.
                  </p>
                </>
              )}

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
                      <span>Creating account...</span>
                    </>
                  ) : role === "TEACHER" ? (
                    "Create Faculty Account"
                  ) : (
                    "Create account"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground sm:text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    Sign in
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

