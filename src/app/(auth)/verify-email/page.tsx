import { Suspense } from "react"
import { VerifyEmailForm } from "./verify-email-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailCardSkeleton />}>
      <VerifyEmailForm />
    </Suspense>
  )
}

function VerifyEmailCardSkeleton() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>Loading...</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
