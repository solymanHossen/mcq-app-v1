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
    <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-6">
      <AuthHeader
        title="Verify your ExamHub account"
        description="Loading verification details..."
      />
      <Card
        className="gap-0 rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 py-0 shadow-xs sm:shadow-sm"
        aria-busy="true"
      >
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <FieldGroup className="gap-4 sm:gap-6" aria-hidden="true">
            <div className="flex justify-center py-1 sm:py-2">
              <div className="flex w-full max-w-xs sm:max-w-sm gap-1 sm:gap-2 justify-center">
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton
                    key={index}
                    className="size-10 xs:size-11 sm:size-12 min-w-0 flex-1 rounded-lg sm:rounded-xl"
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-3.5 border-t border-border/60 pt-4 sm:gap-4 sm:pt-5">
              <Skeleton className="h-11.5 w-full rounded-xl sm:h-13 sm:rounded-2xl" />
              <Skeleton className="h-10 w-full rounded-xl sm:h-11 sm:rounded-2xl" />
              <Skeleton className="h-4 w-24 sm:h-5" />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
