import { Suspense } from "react"
import { ResetPasswordForm } from "./reset-password-form"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthHeader } from "@/components/auth/auth-header"

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  return (
    <Suspense fallback={<ResetPasswordCardSkeleton />}>
      <ResetPasswordLoader params={params} />
    </Suspense>
  )
}

async function ResetPasswordLoader({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <ResetPasswordForm token={token} />
}

function ResetPasswordCardSkeleton() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-6">
      <AuthHeader
        title="Create new password"
        description="Choose a strong password for your ExamHub account"
      />
      <Card
        className="gap-0 rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-0 py-0 shadow-xs sm:shadow-sm"
        aria-busy="true"
      >
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <FieldGroup className="gap-4 sm:gap-6" aria-hidden="true">
            {[0, 1].map((index) => (
              <Field key={index}>
                <Skeleton className="h-4 w-32 sm:h-5 sm:w-36" />
                <Skeleton className="h-11 w-full rounded-xl sm:h-12 sm:rounded-2xl" />
              </Field>
            ))}
            <div className="flex flex-col items-center gap-3.5 border-t border-border/60 pt-4 sm:gap-4 sm:pt-5">
              <Skeleton className="h-11.5 w-full rounded-xl sm:h-13 sm:rounded-2xl" />
              <Skeleton className="h-4 w-24 sm:h-5" />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
