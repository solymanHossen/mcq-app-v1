import { Suspense } from "react"
import { LoginForm } from "./login-form"
import { Card } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginCardSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginCardSkeleton() {
  return (
    <Card className="w-full max-w-[420px] rounded-2xl border-border/80 bg-card p-6 sm:p-8 shadow-sm">
      <AuthHeader
        title="Sign in to ExamHub"
        description="Access your exams, question banks, and live results"
      />
      <div className="flex flex-col gap-4">
        <div className="h-11 rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-11 rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-11 rounded-xl bg-muted/60 animate-pulse mt-2" />
      </div>
    </Card>
  )
}
