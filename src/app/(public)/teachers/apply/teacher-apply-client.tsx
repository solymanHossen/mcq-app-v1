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
import { registerAction } from "@/modules/auth/actions"
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

  // Guest registration state
  const [guestState, guestAction, isGuestPending] = React.useActionState(
    registerAction,
    undefined
  )

  // Student upgrade state
  const [isUpgrading, setIsUpgrading] = React.useState(false)
  const [upgradeError, setUpgradeError] = React.useState<string | null>(null)
  const [upgradeSuccess, setUpgradeSuccess] = React.useState(false)

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
        window.location.href = "/teacher"
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

              <Button asChild size="default" className="rounded-xl font-bold shadow-xs shrink-0">
                <Link href="/teacher">
                  <span>Open Teacher Workspace</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isVerified
                ? "Your teacher account is fully accredited. You can publish examinations, author questions in the question bank, and grade student submissions."
                : isRejected
                ? "Your faculty application was reviewed and could not be approved at this time. Please contact support or an administrator for details."
                : "Your faculty account is pending review by the platform administrator. You can draft exams and questions right away; publishing them for live candidates will unlock once verified."}
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
                Your faculty account has been created and submitted for review. Redirecting to workspace...
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
                  Upgrading profile for: {currentUser.name}
                </span>
                <p className="text-muted-foreground">
                  Logged in as <strong className="text-foreground">{currentUser.email}</strong>. After submitting, your role will be upgraded to Faculty Instructor, and administrators will review your institution credentials.
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

  // CASE 3: GUEST VISITOR (NEW REGISTRATION MODE)
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
            <Link href="/login">
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

      {/* Guest Application Form */}
      <form action={guestAction} className="space-y-6 sm:space-y-8">
        <input type="hidden" name="role" value="TEACHER" />

        {guestState?.error && (
          <Alert variant="destructive" className="rounded-xl border-destructive/30">
            <AlertTriangle className="size-4" />
            <AlertTitle>Application Error</AlertTitle>
            <AlertDescription>{guestState.error}</AlertDescription>
          </Alert>
        )}

        {/* Card 1: Account Credentials */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center gap-3">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-primary/20">
              <User className="size-4.5 sm:size-5.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                Account Credentials
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                Your login credentials for managing tests and question banks
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Prof. Jane Doe"
                  autoComplete="name"
                  className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Official / Academic Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="faculty@university.edu"
                  autoComplete="email"
                  className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl"
                required
              />
            </div>
          </div>
        </Card>

        {/* Card 2: Academic Affiliation */}
        <Card className="rounded-2xl border border-border/70 bg-card p-0 gap-0 py-0 shadow-xs hover:shadow-sm transition-all overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border/50 bg-muted/20 flex items-center gap-3">
            <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-indigo-500/20">
              <Building2 className="size-4.5 sm:size-5.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground">
                Academic Affiliation
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                University, college, school, coaching academy, or examination board
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="institution" className="text-sm font-semibold text-foreground">
                  Institution Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="institution"
                  name="institution"
                  placeholder="e.g. Dhaka University / Oxford Academy"
                  className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-semibold text-foreground">
                  Department / Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="e.g. Physics / Computer Science"
                  className="h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-sm font-semibold text-foreground">
                  Academic Background / Bio <span className="text-destructive">*</span>
                </Label>
                <span className="text-xs text-muted-foreground">Minimum 10 characters</span>
              </div>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                placeholder="Mention your designation, years of teaching, or topics you conduct examinations for..."
                className="rounded-xl text-sm sm:text-base min-h-[110px] resize-y p-4 leading-relaxed"
                required
              />
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground">
            By registering, you agree to ExamHub&apos;s Terms of Service and Privacy Policy.
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={isGuestPending}
            className="h-11 sm:h-12 px-8 rounded-xl font-bold shadow-md text-sm sm:text-base w-full sm:w-auto"
          >
            {isGuestPending ? (
              <>
                <Spinner data-icon="inline-start" />
                <span>Creating Faculty Account...</span>
              </>
            ) : (
              <>
                <GraduationCap className="size-4 mr-2" />
                <span>Register &amp; Apply as Faculty</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
