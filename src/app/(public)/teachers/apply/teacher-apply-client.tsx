"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  BookOpen,
  FileText,
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  User,
  Mail,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { applyForTeacherRoleAction } from "@/modules/users/actions"
import { toast } from "sonner"

interface TeacherApplyClientProps {
  currentUser: {
    id: string
    name: string
    email: string
    role: string
    teacherVerificationStatus: string
    institution: string | null
    department: string | null
    bio: string | null
  } | null
}

export function TeacherApplyClient({ currentUser }: TeacherApplyClientProps) {
  const router = useRouter()

  // Student upgrade state
  const [isUpgrading, setIsUpgrading] = React.useState(false)
  const [upgradeError, setUpgradeError] = React.useState<string | null>(null)
  const [upgradeSuccess, setUpgradeSuccess] = React.useState(false)
  const [isEditingApplication, setIsEditingApplication] = React.useState(false)

  async function handleStudentUpgrade(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUpgradeError(null)
    setIsUpgrading(true)

    const formData = new FormData(e.currentTarget)
    try {
      const res = await applyForTeacherRoleAction(undefined, formData)
      if (res?.error) {
        setUpgradeError(res.error)
        setIsUpgrading(false)
        return
      }

      setUpgradeSuccess(true)
      toast.success("Teacher application submitted successfully!")

      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
    } catch {
      setUpgradeError("An unexpected error occurred. Please try again.")
    } finally {
      setIsUpgrading(false)
    }
  }

  // CASE 1: ALREADY A TEACHER
  if (currentUser?.role === "TEACHER") {
    const isVerified = currentUser.teacherVerificationStatus === "VERIFIED"
    const isRejected = currentUser.teacherVerificationStatus === "REJECTED"

    return (
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Header & Back Button */}
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs group gap-1.5 sm:gap-2"
          >
            <Link href="/teachers">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Directory</span>
            </Link>
          </Button>
        </div>

        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Faculty Accreditation Status
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Current status of your academic instructor profile
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/70 bg-muted/15">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg font-bold text-foreground">
                    {currentUser.name}
                  </span>
                  {isVerified ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1 rounded-full text-xs font-semibold">
                      <CheckCircle2 className="size-3.5" />
                      <span>Verified Faculty</span>
                    </Badge>
                  ) : isRejected ? (
                    <Badge variant="destructive" className="gap-1 rounded-full text-xs font-semibold">
                      <AlertTriangle className="size-3.5" />
                      <span>Application Denied</span>
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1 rounded-full text-xs font-semibold">
                      <Clock className="size-3.5" />
                      <span>Under Administrative Review</span>
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentUser.email}
                  {currentUser.institution && ` • ${currentUser.institution}`}
                </p>
              </div>

              {isVerified ? (
                <Button asChild size="default" className="rounded-xl font-bold shadow-xs shrink-0">
                  <Link href="/teacher">
                    <span>Open Teacher Workspace</span>
                    <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="default" className="rounded-xl font-semibold border-border/70 shrink-0">
                  <Link href="/dashboard">
                    <span>Return to Dashboard</span>
                  </Link>
                </Button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isVerified
                ? "Your teacher account is fully accredited. You can publish examinations, author questions in the question bank, and grade student submissions."
                : isRejected
                ? "Your faculty application was reviewed and could not be approved at this time. Please contact support or an administrator for details."
                : "Your faculty application is currently under administrative review. Once verified by an administrator, your Teacher Workspace and exam authoring features will automatically unlock."}
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // CASE 1.5: SIGNED IN AS ADMIN OR SUPER_ADMIN
  if (currentUser && (currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN")) {
    return (
      <div className="w-full space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs group gap-1.5 sm:gap-2"
          >
            <Link href="/teachers">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Directory</span>
            </Link>
          </Button>
        </div>

        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Administrator Access Detected
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                You are currently signed in with elevated administrative permissions
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/70 bg-muted/15">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg font-bold text-foreground">
                    {currentUser.name}
                  </span>
                  <Badge variant="outline" className="gap-1 rounded-full text-xs font-semibold border-primary/30 text-primary">
                    <ShieldCheck className="size-3.5" />
                    <span>{currentUser.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</span>
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>

              <Button asChild size="default" className="rounded-xl font-bold shadow-xs shrink-0">
                <Link href="/admin/teachers">
                  <span>Manage Teacher Verifications</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              As an administrator, you already possess platform-wide privileges. You can review pending teacher applications, approve or reject credentials, and monitor faculty activities directly through the admin control panel.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // CASE 2: LOGGED-IN STUDENT (UPGRADE MODE)
  if (currentUser && currentUser.role === "STUDENT") {
    // If student has already submitted an application and it is pending
    if (currentUser.institution && currentUser.teacherVerificationStatus === "PENDING" && !isEditingApplication) {
      return (
        <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16">
          <div className="flex items-center justify-between">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs group gap-1.5 sm:gap-2"
            >
              <Link href="/teachers">
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back to Directory</span>
              </Link>
            </Button>
          </div>

          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    Faculty Accreditation Under Review
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Your application to become an accredited instructor is being reviewed
                  </p>
                </div>
              </div>
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1 rounded-full text-xs font-semibold self-start sm:self-auto">
                <Clock className="size-3.5" />
                <span>Pending Review</span>
              </Badge>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/70 bg-muted/15 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Affiliated Institution</span>
                  <p className="text-sm font-semibold text-foreground">{currentUser.institution}</p>
                </div>
                <div className="p-4 rounded-xl border border-border/70 bg-muted/15 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Department / Specialization</span>
                  <p className="text-sm font-semibold text-foreground">{currentUser.department || "N/A"}</p>
                </div>
              </div>

              {currentUser.bio && (
                <div className="p-4 rounded-xl border border-border/70 bg-muted/15 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Academic Statement / Bio</span>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">{currentUser.bio}</p>
                </div>
              )}

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground font-semibold">Active Student Access:</strong> You remain an active student! Your student dashboard, examination attempts, mistakes notebook, and progress tracking remain 100% active and accessible with zero interruption.
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button asChild size="default" className="rounded-xl font-bold shadow-xs w-full sm:w-auto">
                  <Link href="/dashboard">
                    <span>Go to Student Dashboard</span>
                    <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingApplication(true)}
                  className="rounded-xl font-semibold border-border/70 w-full sm:w-auto"
                >
                  Update Application Details
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return (
      <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16">
        {/* Top Header & Breadcrumb */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs group gap-1.5 sm:gap-2"
            >
              <Link href="/teachers">
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back to Directory</span>
              </Link>
            </Button>
            {isEditingApplication && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingApplication(false)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel Editing
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {isEditingApplication ? "Update Faculty Application" : "Apply for Faculty Accreditation"}
              </h1>
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
              >
                <GraduationCap className="size-3 text-primary" />
                <span>Account Upgrade</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Upgrade Form */}
        <form onSubmit={handleStudentUpgrade} className="space-y-6 sm:space-y-8">
          {upgradeError && (
            <Alert variant="destructive" className="rounded-xl border-destructive/30">
              <AlertTriangle className="size-4" />
              <AlertTitle>Application Error</AlertTitle>
              <AlertDescription>{upgradeError}</AlertDescription>
            </Alert>
          )}

          {upgradeSuccess && (
            <Alert className="rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle>Application Received</AlertTitle>
              <AlertDescription>
                Your faculty application has been submitted for review. Redirecting to your student dashboard...
              </AlertDescription>
            </Alert>
          )}

          {/* Current Account Notice */}
          <Card className="rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <User className="size-4.5" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <span className="font-semibold text-foreground">
                  Faculty application for: {currentUser.name}
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  Logged in as <strong className="text-foreground">{currentUser.email}</strong>. You will retain full, uninterrupted access to your student dashboard and exams while administrators review your credentials.
                </p>
              </div>
            </div>
          </Card>

          {/* Card 1: Academic Affiliation */}
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center gap-3">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
                <Building2 className="size-4.5 sm:size-5.5" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                  Institution &amp; Department
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                  Specify your affiliated university, college, school, or training institute
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="institution" className="text-sm font-semibold text-foreground">
                  Institution / Organization Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="institution"
                  name="institution"
                  defaultValue={currentUser.institution || ""}
                  placeholder="e.g. University of Dhaka / Stanford University / Milestone College"
                  className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-semibold text-foreground">
                  Department / Subject Specialization <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={currentUser.department || ""}
                  placeholder="e.g. Department of Computer Science & Engineering / Higher Mathematics"
                  className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Card 2: Qualifications & Statement */}
          <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center gap-3">
              <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-indigo-500/20">
                <FileText className="size-4.5 sm:size-5.5" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                  Academic Credentials &amp; Statement
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                  Summary of your teaching qualifications, designation, and exam scope
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-sm font-semibold text-foreground">
                    Statement / Teaching Background <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">Minimum 10 characters</span>
                </div>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  defaultValue={currentUser.bio || ""}
                  placeholder="Describe your teaching experience, subjects of focus, academic achievements, or target student body..."
                  className="rounded-xl text-sm sm:text-base min-h-[110px] resize-y p-4 leading-relaxed"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground">
              By submitting, you agree to ExamHub&apos;s academic standards and exam honor policies.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={isUpgrading || upgradeSuccess}
              className="h-11 sm:h-12 px-8 rounded-xl font-bold shadow-md text-sm sm:text-base w-full sm:w-auto"
            >
              {isUpgrading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="size-4 mr-2" />
                  <span>Submit Faculty Application</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  // CASE 3: GUEST VISITOR (REQUIRES LOGIN TO APPLY)
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs group gap-1.5 sm:gap-2"
          >
            <Link href="/teachers">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Directory</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs sm:text-sm font-semibold text-primary hover:text-primary/90 gap-1.5"
          >
            <Link href="/login?callbackUrl=/teachers/apply">
              <span>Already registered? Sign in</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Apply for Faculty Accreditation
            </h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 border border-border/60"
            >
              <GraduationCap className="size-3.5 text-primary" />
              <span>Teacher Application</span>
            </Badge>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs overflow-hidden">
        <div className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="size-16 sm:size-20 rounded-2xl sm:rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto ring-1 ring-primary/20 shadow-2xs">
            <GraduationCap className="size-8 sm:size-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Sign In to Submit Faculty Credentials
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              To ensure academic integrity, teacher and faculty applications require an active account. Please sign in to your ExamHub account or create an account to submit your qualifications for administrative verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="h-11 sm:h-12 px-6 rounded-xl font-bold shadow-md w-full sm:w-auto">
              <Link href="/login?callbackUrl=/teachers/apply">
                <User className="size-4 mr-2" />
                <span>Sign In to Apply</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 sm:h-12 px-6 rounded-xl font-semibold border-border/70 w-full sm:w-auto">
              <Link href="/register">
                <span>Create an Account</span>
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
