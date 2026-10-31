import { Suspense } from "react"
import { VerifyEmailForm } from "./verify-email-form"
import { Card, CardContent } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthHeader } from "@/components/auth/auth-header"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailCardSkeleton />}>
      <VerifyEmailForm />
    </Suspense>
  )
}

function VerifyEmailCardSkeleton() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6 sm:gap-8">
      <AuthHeader
        title="Verify your ExamHub account"
        description="Loading verification details..."
      />
      <Card
        className="gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs"
        aria-busy="true"
      >
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <FieldGroup className="gap-5 sm:gap-6" aria-hidden="true">
            <div className="flex justify-center py-2">
              <div className="flex w-full max-w-sm gap-1.5 sm:gap-2">
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton
                    key={index}
                    className="h-11 min-w-0 flex-1 rounded-xl sm:h-12"
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 border-t border-border/60 pt-4 sm:pt-5">
              <Skeleton className="h-12 w-full rounded-xl sm:h-13" />
              <Skeleton className="h-11 w-full rounded-xl sm:h-12 sm:rounded-2xl" />
              <Skeleton className="h-4 w-24 sm:h-5" />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
