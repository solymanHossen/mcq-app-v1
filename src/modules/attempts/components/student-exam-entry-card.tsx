"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  User,
  Mail,
  Lock,
  Camera,
  Play,
  ArrowRight,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { APP_NAME } from "@/lib/config"
import {
  startAttemptAction,
  startGuestExamAction,
} from "@/modules/attempts/actions"

export interface StudentExamEntryCardProps {
  exam: {
    id: string
    title: string
    durationMinutes: number
    maxAttempts: number
    allowGuestAccess: boolean
    accessCode: string | null
    webcamMonitoringRequired: boolean
    startTime: Date | null
    endTime: Date | null
  }
  user: {
    id: string
    name: string
    email: string
    role: string
  } | null
  existingAttemptsCount: number
}

export function StudentExamEntryCard({
  exam,
  user,
  existingAttemptsCount,
}: StudentExamEntryCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form states for guest
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [webcamConsent, setWebcamConsent] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const attemptsLeft = exam.maxAttempts - existingAttemptsCount

  function handleStartForLoggedInUser() {
    setErrorMessage(null)
    startTransition(async () => {
      const res = await startAttemptAction(exam.id, {
        webcamConsent,
        accessCode: accessCode.trim() || undefined,
      })

      if ("error" in res) {
        setErrorMessage(res.error)
        toast.error(res.error)
        return
      }

      toast.success("Exam started!")
      router.push(`/exams/${exam.id}/attempt/${res.attemptId}`)
    })
  }

  function handleStartForGuest(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage("Please enter your full name")
      return
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address")
      return
    }

    if (exam.accessCode && !accessCode.trim()) {
      setErrorMessage("Please enter the exam passcode provided by your teacher")
      return
    }

    if (exam.webcamMonitoringRequired && !webcamConsent) {
      setErrorMessage("You must accept webcam monitoring to start this exam")
      return
    }

    startTransition(async () => {
      const res = await startGuestExamAction({
        examId: exam.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        accessCode: accessCode.trim() || undefined,
        webcamConsent,
      })

      if ("error" in res) {
        setErrorMessage(res.error)
        toast.error(res.error)
        return
      }

      toast.success("Welcome! Starting your exam now...")
      router.push(`/exams/${exam.id}/attempt/${res.attemptId}`)
    })
  }

  // Case 1: Logged In User
  if (user) {
    return (
      <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-xs hover:shadow-sm transition-all">
        {/* Soft Ambient System Gradient Bloom - Light & Clean (matching profile hero) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-primary/[0.05] blur-3xl dark:bg-primary/[0.08]"
        />
        {/* Subtle Radiant Top Accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        />

        <CardHeader className="relative z-10 p-5 sm:p-6 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl border border-border/60 bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-2xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <CardTitle className="font-heading text-base sm:text-base font-bold text-foreground">
                  Logged in as {user.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-xs text-muted-foreground">
                  {user.email} · <span className="uppercase font-semibold tracking-wider">{user.role}</span>
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold border-border/70"
            >
              {attemptsLeft > 0 ? `${attemptsLeft} attempt(s) left` : "No attempts left"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-5 sm:p-6 space-y-4 sm:space-y-5">
          {errorMessage && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm sm:text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {exam.accessCode && (
            <div className="space-y-1.5">
              <Label htmlFor="loggedInAccessCode" className="text-sm sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="size-3.5 text-muted-foreground" />
                <span>Exam Passcode (Required)</span>
              </Label>
              <Input
                id="loggedInAccessCode"
                placeholder="Enter exam passcode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="h-11 sm:h-11 text-base sm:text-sm font-mono rounded-xl border border-border/70 bg-background"
              />
            </div>
          )}

          {exam.webcamMonitoringRequired && (
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
              <input
                type="checkbox"
                checked={webcamConsent}
                onChange={(e) => setWebcamConsent(e.target.checked)}
                className="size-4 mt-0.5 rounded text-primary focus:ring-primary"
              />
              <div className="text-sm sm:text-xs text-foreground">
                <span className="font-bold flex items-center gap-1.5">
                  <Camera className="size-3.5 text-primary" />
                  <span>Webcam Consent Required</span>
                </span>
                <p className="text-muted-foreground text-xs sm:text-xs mt-0.5">
                  I agree to webcam proctoring during this assessment.
                </p>
              </div>
            </label>
          )}

          {attemptsLeft <= 0 ? (
            <div className="text-center py-3 space-y-2">
              <p className="text-sm sm:text-sm text-muted-foreground font-medium">
                You have reached the maximum allowed attempts for this exam.
              </p>
              <Button asChild variant="outline" className="rounded-xl font-bold text-xs sm:text-xs h-9">
                <Link href={`/exams/${exam.id}`}>View Your Results & History</Link>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={handleStartForLoggedInUser}
              disabled={isPending || (exam.webcamMonitoringRequired && !webcamConsent)}
              className="w-full h-12 sm:h-12 rounded-xl font-heading font-bold text-base sm:text-base cursor-pointer shadow-xs hover:shadow-sm active:scale-98 transition-all gap-2 group"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  <span>Starting Exam...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current shrink-0" />
                  <span>{existingAttemptsCount > 0 ? "Start Next Attempt" : "Start Exam Now"}</span>
                  <ArrowRight className="size-4 ml-auto shrink-0 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Case 2: Guest Participation Allowed (Frictionless Name & Email)
  if (exam.allowGuestAccess) {
    return (
      <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-xs hover:shadow-sm transition-all">
        {/* Soft Ambient System Gradient Bloom - Light & Clean (matching profile hero) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-primary/[0.05] blur-3xl dark:bg-primary/[0.08]"
        />
        {/* Subtle Radiant Top Accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        />

        <CardHeader className="relative z-10 p-5 sm:p-6 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="font-heading text-xl sm:text-xl font-bold tracking-tight text-foreground">
                Enter Your Details
              </CardTitle>
              <CardDescription className="text-sm sm:text-sm text-muted-foreground mt-0.5">
                Provide your name and email to begin the exam.
              </CardDescription>
            </div>

            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-xs sm:text-sm font-bold gap-1.5 border-primary/30 bg-primary/10 text-primary shadow-2xs"
            >
              <Clock className="size-3.5" />
              <span>{exam.durationMinutes} Minutes</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-5 sm:p-6 space-y-4 sm:space-y-5">
          <form onSubmit={handleStartForGuest} className="space-y-4">
            {errorMessage && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm sm:text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Student Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="guestName" className="text-sm sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                <span>Your Full Name <span className="text-destructive">*</span></span>
              </Label>
              <Input
                id="guestName"
                name="name"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 sm:h-11 rounded-xl text-base sm:text-sm font-medium bg-background border border-border/70 focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-muted-foreground/50 transition-colors"
                disabled={isPending}
                autoFocus
              />
            </div>

            {/* Student Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="guestEmail" className="text-sm sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                <span>Your Email Address <span className="text-destructive">*</span></span>
              </Label>
              <Input
                id="guestEmail"
                name="email"
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 sm:h-11 rounded-xl text-base sm:text-sm font-medium bg-background border border-border/70 focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-muted-foreground/50 transition-colors"
                disabled={isPending}
              />
              <p className="text-xs sm:text-xs text-muted-foreground">
                Your exam result and score summary will be linked to this email.
              </p>
            </div>

            {/* Optional Passcode if set by teacher */}
            {exam.accessCode && (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="guestAccessCode" className="text-sm sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5 text-amber-500" />
                  <span>Exam Passcode / PIN <span className="text-destructive">*</span></span>
                </Label>
                <Input
                  id="guestAccessCode"
                  name="accessCode"
                  required
                  placeholder="Enter exam passcode"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="h-11 sm:h-11 rounded-xl text-base sm:text-sm font-mono bg-background border border-border/70 focus-visible:ring-2 focus-visible:ring-primary/20"
                  disabled={isPending}
                />
              </div>
            )}

            {/* Webcam consent if required */}
            {exam.webcamMonitoringRequired && (
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={webcamConsent}
                  onChange={(e) => setWebcamConsent(e.target.checked)}
                  className="size-4 mt-0.5 rounded text-primary focus:ring-primary"
                  required
                />
                <div className="text-sm sm:text-xs text-foreground">
                  <span className="font-bold flex items-center gap-1.5">
                    <Camera className="size-3.5 text-primary" />
                    <span>Webcam Proctoring Required</span>
                  </span>
                  <p className="text-muted-foreground text-xs sm:text-xs mt-0.5">
                    I agree to camera proctoring during this assessment.
                  </p>
                </div>
              </label>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isPending || (exam.webcamMonitoringRequired && !webcamConsent)}
              className="w-full h-12 sm:h-12 rounded-xl font-heading font-bold text-base sm:text-base cursor-pointer shadow-xs hover:shadow-sm active:scale-98 transition-all gap-2 group mt-2"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  <span>Setting up your exam session...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current shrink-0" />
                  <span>Start Exam Now</span>
                  <ArrowRight className="size-4 ml-auto shrink-0 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          {/* Alternative login link */}
          <div className="pt-3 text-center border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              Already have an {APP_NAME} account?{" "}
              <Link
                href={`/login?callbackUrl=/exam/${exam.id}`}
                className="font-semibold text-primary hover:underline"
              >
                Sign in to save to your profile →
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Case 3: Registered Students Only (allowGuestAccess = false)
  return (
    <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-xs p-6 sm:p-8 text-center space-y-4">
      {/* Soft Ambient System Gradient Bloom - Light & Clean (matching profile hero) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-primary/[0.05] blur-3xl dark:bg-primary/[0.08]"
      />
      {/* Subtle Radiant Top Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      />

      <div className="relative z-10 space-y-4">
        <div className="size-12 rounded-2xl border border-border/60 bg-muted/40 text-muted-foreground flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="size-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-base sm:text-lg text-foreground">
            Student Account Required
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            The teacher has restricted this assessment to registered students. Please sign in or create an account to proceed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto h-10 px-5 rounded-xl font-heading font-bold text-xs sm:text-sm">
            <Link href={`/login?callbackUrl=/exam/${exam.id}`}>
              Sign In to Start
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-10 px-5 rounded-xl font-heading font-bold text-xs sm:text-sm border-border/70">
            <Link href={`/register?callbackUrl=/exam/${exam.id}`}>
              Create Free Account
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
