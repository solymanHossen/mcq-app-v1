import { Suspense } from "react"
import { LoginForm } from "./login-form"
import { Card, CardContent } from "@/components/ui/card"
import { AuthHeader } from "@/components/auth/auth-header"
import { Skeleton } from "@/components/ui/skeleton"
import { APP_NAME } from "@/lib/config"

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
      className="flex w-full min-w-0 flex-col gap-4 sm:gap-6"
      aria-busy="true"
    >
      <AuthHeader
        title={`Sign in to ${APP_NAME}`}
        description="Access your exams, question banks, and live results"
      />
      <Card className="gap-0 rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 py-0 shadow-xs sm:shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <Skeleton className="h-4 w-24 sm:h-5" />
            <Skeleton className="h-11 w-full rounded-xl sm:h-12 sm:rounded-2xl" />
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-20 sm:h-5" />
              <Skeleton className="h-3.5 w-24 sm:h-4 sm:w-28" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl sm:h-12 sm:rounded-2xl" />
          </div>
          <div className="flex flex-col items-center gap-3.5 border-t border-border/60 pt-4 sm:gap-4 sm:pt-5">
            <Skeleton className="h-11.5 w-full rounded-xl sm:h-13 sm:rounded-2xl" />
            <Skeleton className="h-4 w-52 max-w-full sm:h-5 sm:w-56" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
