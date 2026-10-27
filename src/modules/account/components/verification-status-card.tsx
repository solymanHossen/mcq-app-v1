import { Clock, ShieldAlert, ShieldCheck } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type { TeacherVerificationStatus } from "@/prisma/generated/prisma/client"

export function VerificationStatusCard({
  status,
  note,
}: {
  status: TeacherVerificationStatus
  note: string | null
}) {
  return (
    <Card className="rounded-[24px] border border-border/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-300 hover:shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <CardHeader className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
              status === "VERIFIED"
                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                : status === "REJECTED"
                  ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                  : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
            }`}
          >
            {status === "VERIFIED" ? (
              <ShieldCheck className="size-6 stroke-[2.2]" />
            ) : status === "REJECTED" ? (
              <ShieldAlert className="size-6 stroke-[2.2]" />
            ) : (
              <Clock className="size-6 stroke-[2.2]" />
            )}
          </span>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <CardTitle className="font-heading text-lg font-bold text-foreground">
                Faculty Accreditation Status
              </CardTitle>
            </div>
            <CardDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {status === "VERIFIED" &&
                "Your educator credentials have been verified by platform administrators. You are authorized to publish live exams and manage question banks."}
              {status === "PENDING" &&
                "Your educator verification is currently under review by administrators. You can freely draft questions and build exams in your private workspace."}
              {status === "REJECTED" &&
                "Your verification application was not approved. You can still author questions in private mode, but public exam publishing remains restricted."}
            </CardDescription>
            {note && status !== "VERIFIED" && (
              <p className="mt-2 rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Administrative Note:
                </span>{" "}
                {note}
              </p>
            )}
          </div>
        </div>

        {/* Verification Status Pill Matching Teacher Directory */}
        <div className="shrink-0 self-start sm:self-center">
          {status === "VERIFIED" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-600 shadow-2xs ring-1 ring-emerald-500/25 sm:px-4 sm:py-2 sm:text-sm dark:bg-emerald-500/15 dark:text-emerald-400">
              <ShieldCheck className="size-4 stroke-[2.5]" />
              <span>Verified Educator</span>
            </span>
          )}
          {status === "PENDING" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-600 shadow-2xs ring-1 ring-amber-500/25 sm:px-4 sm:py-2 sm:text-sm dark:bg-amber-500/15 dark:text-amber-400">
              <Clock className="size-4 stroke-[2.5]" />
              <span>Pending Review</span>
            </span>
          )}
          {status === "REJECTED" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-600 shadow-2xs ring-1 ring-rose-500/25 sm:px-4 sm:py-2 sm:text-sm dark:bg-rose-500/15 dark:text-rose-400">
              <ShieldAlert className="size-4 stroke-[2.5]" />
              <span>Accreditation Rejected</span>
            </span>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
