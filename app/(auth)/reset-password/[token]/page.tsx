import { Suspense } from "react"
import { ResetPasswordForm } from "./reset-password-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>New password</CardTitle>
        <CardDescription>Choose a strong password</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Loading...
      </CardContent>
    </Card>
  )
}
