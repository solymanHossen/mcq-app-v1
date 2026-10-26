import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TeacherVerificationStatus } from "@/prisma/generated/prisma/client"

const STATUS_COPY: Record<
  TeacherVerificationStatus,
  { label: string; description: string; icon: typeof ShieldCheck; badgeVariant: "default" | "secondary" | "destructive" }
> = {
  VERIFIED: {
    label: "Verified",
    description: "Your account is verified — you can publish exams to students.",
    icon: ShieldCheck,
    badgeVariant: "default",
  },
  PENDING: {
    label: "Pending review",
    description:
      "An admin hasn't reviewed your account yet. You can draft questions and exams freely, but publishing is disabled until you're verified.",
    icon: ShieldQuestion,
    badgeVariant: "secondary",
  },
  REJECTED: {
    label: "Rejected",
    description:
      "An admin rejected your verification request. You can keep drafting, but publishing stays disabled until an admin re-verifies your account.",
    icon: ShieldAlert,
    badgeVariant: "destructive",
  },
}

export function VerificationStatusCard({
  status,
  note,
}: {
  status: TeacherVerificationStatus
  note: string | null
}) {
  const { label, description, icon: Icon, badgeVariant } = STATUS_COPY[status]

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            status === "VERIFIED"
              ? "bg-primary/10 text-primary"
              : status === "REJECTED"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle>Teacher verification</CardTitle>
            <Badge variant={badgeVariant}>{label}</Badge>
          </div>
          <CardDescription>{description}</CardDescription>
          {note && status !== "VERIFIED" && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Admin note:</span> {note}
            </p>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
