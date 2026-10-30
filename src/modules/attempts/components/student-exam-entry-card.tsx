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
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
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
      <Card className="rounded-2xl border border-border/80 bg-card shadow-lg overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Logged in as {user.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {user.email} · {user.role}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              {attemptsLeft > 0 ? `${attemptsLeft} attempt(s) left` : "No attempts left"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {exam.accessCode && (
            <div className="space-y-1.5">
              <Label htmlFor="loggedInAccessCode" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Lock className="size-3.5 text-muted-foreground" />
                <span>Exam Passcode (Required)</span>
              </Label>
              <Input
                id="loggedInAccessCode"
                placeholder="Enter passcode provided by teacher"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="h-10 text-sm font-mono rounded-xl"
              />
            </div>
          )}

          {exam.webcamMonitoringRequired && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
              <input
                type="checkbox"
                checked={webcamConsent}
                onChange={(e) => setWebcamConsent(e.target.checked)}
                className="size-4 mt-0.5 rounded text-primary focus:ring-primary"
              />
              <div className="text-xs text-foreground">
                <span className="font-bold flex items-center gap-1">
                  <Camera className="size-3.5 text-primary" />
                  <span>Webcam Consent Required</span>
                </span>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  I agree to webcam proctoring during this assessment.
                </p>
              </div>
            </label>
          )}

          {attemptsLeft <= 0 ? (
            <div className="text-center py-2 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                You have reached the maximum allowed attempts for this exam.
              </p>
              <Button asChild variant="outline" className="rounded-xl font-bold text-xs">
                <Link href={`/exams/${exam.id}`}>View Your Results & History</Link>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={handleStartForLoggedInUser}
              disabled={isPending || (exam.webcamMonitoringRequired && !webcamConsent)}
              className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base cursor-pointer shadow-md active:scale-98 transition-all gap-2"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  <span>Starting Exam...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>{existingAttemptsCount > 0 ? "Start Next Attempt" : "Start Exam Now"}</span>
                  <ArrowRight className="size-4 ml-auto" />
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
      <Card className="rounded-2xl border-2 border-primary/30 bg-card shadow-xl overflow-hidden relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-indigo-500 to-sky-400" />
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-primary/10 text-primary border-primary/30 text-xs font-bold gap-1 py-1">
              <Sparkles className="size-3" />
              <span>Instant Entry (No Password Needed)</span>
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              Duration: <strong className="text-foreground">{exam.durationMinutes}m</strong>
            </span>
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-foreground mt-2">
            Enter Your Details to Begin
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            No registration or account creation required. Just provide your Name & Email so your teacher can identify your submission.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-3 space-y-4">
          <form onSubmit={handleStartForGuest} className="space-y-3.5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Student Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="guestName" className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                <span>Your Full Name <span className="text-destructive">*</span></span>
              </Label>
              <Input
                id="guestName"
                name="name"
                required
                placeholder="e.g. Solyman Hossen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl text-sm bg-background border-border/80 focus-visible:ring-primary/20"
                disabled={isPending}
                autoFocus
              />
            </div>

            {/* Student Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="guestEmail" className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-primary" />
                <span>Your Email Address <span className="text-destructive">*</span></span>
              </Label>
              <Input
                id="guestEmail"
                name="email"
                type="email"
                required
                placeholder="e.g. solyman@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl text-sm bg-background border-border/80 focus-visible:ring-primary/20"
                disabled={isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Your exam result and score summary will be linked to this email.
              </p>
            </div>

            {/* Optional Passcode if set by teacher */}
            {exam.accessCode && (
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="guestAccessCode" className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5 text-amber-500" />
                  <span>Exam Passcode / PIN <span className="text-destructive">*</span></span>
                </Label>
                <Input
                  id="guestAccessCode"
                  name="accessCode"
                  required
                  placeholder="Enter passcode provided by your teacher"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="h-11 rounded-xl text-sm font-mono bg-background border-border/80 focus-visible:ring-primary/20"
                  disabled={isPending}
                />
              </div>
            )}

            {/* Webcam consent if required */}
            {exam.webcamMonitoringRequired && (
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webcamConsent}
                  onChange={(e) => setWebcamConsent(e.target.checked)}
                  className="size-4 mt-0.5 rounded text-primary focus:ring-primary"
                  required
                />
                <div className="text-xs text-foreground">
                  <span className="font-bold flex items-center gap-1">
                    <Camera className="size-3.5 text-primary" />
                    <span>Webcam Proctoring Required</span>
                  </span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
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
              className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base cursor-pointer shadow-md hover:shadow-lg active:scale-98 transition-all gap-2 mt-2"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  <span>Setting up your exam session...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>Start Exam Now</span>
                  <ArrowRight className="size-4 ml-auto" />
                </>
              )}
            </Button>
          </form>

          {/* Alternative login link */}
          <div className="pt-2 text-center border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Already have an ExamHub account?{" "}
              <Link
                href={`/login?callbackUrl=/exam/${exam.id}`}
                className="font-bold text-primary hover:underline"
              >
                Sign in to save to your profile
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Case 3: Registered Students Only (allowGuestAccess = false)
  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-lg p-6 text-center space-y-4">
      <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
        <Lock className="size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-base text-foreground">
          Student Account Required
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          The teacher has restricted this assessment to registered students. Please sign in or create an account to proceed.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
        <Button asChild size="lg" className="w-full sm:w-auto h-10 rounded-xl font-bold text-xs">
          <Link href={`/login?callbackUrl=/exam/${exam.id}`}>
            Sign In to Start
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-10 rounded-xl font-bold text-xs">
          <Link href={`/register?callbackUrl=/exam/${exam.id}`}>
            Create Free Account
          </Link>
        </Button>
      </div>
    </Card>
  )
}
