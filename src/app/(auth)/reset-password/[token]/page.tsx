import { Suspense } from "react"
import { ResetPasswordForm } from "./reset-password-form"
import { Card } from "@/components/ui/card"
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
    <Card className="w-full max-w-[420px] rounded-2xl border-border/80 bg-card p-6 sm:p-8 shadow-sm">
      <AuthHeader
        title="Create new password"
        description="Choose a strong password for your ExamHub account"
      />
      <div className="flex flex-col gap-4">
        <div className="h-11 rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-11 rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-11 rounded-xl bg-muted/60 animate-pulse mt-2" />
      </div>
    </Card>
  )
}
