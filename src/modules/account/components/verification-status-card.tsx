import { Clock, ShieldAlert, ShieldCheck } from "lucide-react"
import type { TeacherVerificationStatus } from "@/prisma/generated/prisma/client"
import { cn } from "@/lib/utils"

export function VerificationStatusCard({
  status,
  note,
  className,
}: {
  status: TeacherVerificationStatus
  note: string | null
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3.5 rounded-2xl bg-card p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md sm:flex-row sm:items-center sm:rounded-3xl sm:p-5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11 sm:rounded-2xl ${
            status === "VERIFIED"
              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              : status === "REJECTED"
                ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          }`}
        >
          {status === "VERIFIED" ? (
            <ShieldCheck className="size-5 stroke-[2.2] sm:size-6" />
          ) : status === "REJECTED" ? (
            <ShieldAlert className="size-5 stroke-[2.2] sm:size-6" />
          ) : (
            <Clock className="size-5 stroke-[2.2] sm:size-6" />
          )}
        </span>
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold text-foreground sm:text-base">
            Faculty Accreditation
          </p>
          <p className="text-xs text-muted-foreground sm:text-[13px]">
            {status === "VERIFIED" &&
              "Verified by platform administrators · Exam publishing authorized"}
            {status === "PENDING" &&
              "Accreditation review in progress · Drafting enabled in private mode"}
            {status === "REJECTED" &&
              "Accreditation review declined · Public publishing restricted"}
          </p>
          {note && status !== "VERIFIED" && (
            <p className="mt-1 text-xs text-muted-foreground/80">
              Note: {note}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0 self-start sm:self-center">
        {status === "VERIFIED" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-600 shadow-2xs sm:px-4 sm:py-2 sm:text-sm dark:bg-emerald-500/15 dark:text-emerald-400">
            <ShieldCheck className="size-4 stroke-[2.5]" />
            <span>Verified Educator</span>
          </span>
        )}
        {status === "PENDING" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-600 shadow-2xs sm:px-4 sm:py-2 sm:text-sm dark:bg-amber-500/15 dark:text-amber-400">
            <Clock className="size-4 stroke-[2.5]" />
            <span>Pending Review</span>
          </span>
        )}
        {status === "REJECTED" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-600 shadow-2xs sm:px-4 sm:py-2 sm:text-sm dark:bg-rose-500/15 dark:text-rose-400">
            <ShieldAlert className="size-4 stroke-[2.5]" />
            <span>Declined</span>
          </span>
        )}
      </div>
    </div>
  )
}
