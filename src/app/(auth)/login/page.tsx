import { Suspense } from "react"
import { LoginForm } from "./login-form"
import { Card, CardContent } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginCardSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginCardSkeleton() {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-6 sm:gap-8"
      aria-busy="true"
    >
      <AuthHeader
        title="Sign in to ExamHub"
        description="Access your exams, question banks, and live results"
      />
      <Card className="gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs">
        <CardContent className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-24 sm:h-6" />
            <Skeleton className="h-11 w-full rounded-xl sm:h-12 sm:rounded-2xl" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-20 sm:h-6" />
              <Skeleton className="h-4 w-28 sm:h-5" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl sm:h-12 sm:rounded-2xl" />
          </div>
          <div className="flex flex-col items-center gap-4 border-t border-border/60 pt-4 sm:pt-5">
            <Skeleton className="h-12 w-full rounded-xl sm:h-13" />
            <Skeleton className="h-4 w-56 max-w-full sm:h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
