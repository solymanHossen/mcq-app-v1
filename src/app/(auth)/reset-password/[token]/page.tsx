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
    <div className="flex w-full min-w-0 flex-col gap-6 sm:gap-8">
      <AuthHeader
        title="Create new password"
        description="Choose a strong password for your ExamHub account"
      />
      <Card
        className="gap-0 rounded-2xl border border-border/70 bg-card p-0 py-0 shadow-xs"
        aria-busy="true"
      >
        <CardContent className="p-4 sm:p-6 lg:p-7">
          <FieldGroup className="gap-5 sm:gap-6" aria-hidden="true">
            {[0, 1].map((index) => (
              <Field key={index} className="gap-2">
                <Skeleton className="h-5 w-36 sm:h-6" />
                <Skeleton className="h-11 w-full rounded-xl sm:h-12 sm:rounded-2xl" />
              </Field>
            ))}
            <div className="flex flex-col items-center gap-4 border-t border-border/60 pt-4 sm:pt-5">
              <Skeleton className="h-12 w-full rounded-xl sm:h-13" />
              <Skeleton className="h-4 w-24 sm:h-5" />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
