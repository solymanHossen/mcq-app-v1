"use client"

import * as React from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  GraduationCap,
  Clock,
  ShieldAlert,
  Building2,
  BookOpen,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Lock,
  Mail,
  User,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { APP_NAME } from "@/lib/config"
import type { TeacherVerificationStatus } from "@/prisma/generated/prisma/client"

interface TeacherPendingVerificationProps {
  user: {
    id: string
    name: string
    email: string
    institution?: string | null
    department?: string | null
    bio?: string | null
    teacherVerificationStatus: TeacherVerificationStatus
    teacherVerificationNote?: string | null
  }
}

export function TeacherPendingVerification({
  user,
}: TeacherPendingVerificationProps) {
  const isRejected = user.teacherVerificationStatus === "REJECTED"

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-between">
      {/* Top Simple Navigation Bar */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 shadow-2xs group-hover:scale-105 transition-transform">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-heading font-extrabold text-lg tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border/60">
              <User className="size-3.5 text-primary" />
              <span className="font-semibold text-foreground">{user.name}</span>
              <span>({user.email})</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/30"
            >
              <LogOut className="size-3.5" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Gate Card */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-3xl flex-1 flex flex-col justify-center">
        <Card className="rounded-3xl border border-border/70 bg-card p-0 gap-0 shadow-lg overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 border-b border-border/50 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ring-1 ${
                  isRejected
                    ? "bg-destructive/10 text-destructive ring-destructive/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20"
                }`}
              >
                {isRejected ? (
                  <ShieldAlert className="size-6 sm:size-7" />
                ) : (
                  <Clock className="size-6 sm:size-7 animate-pulse" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {isRejected
                      ? "Faculty Accreditation Declined"
                      : "Faculty Verification Pending"}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isRejected
                    ? "Your instructor application was reviewed and could not be verified."
                    : "Your application is currently under administrative review."}
                </p>
              </div>
            </div>

            <div className="shrink-0 self-start sm:self-center">
              {isRejected ? (
                <Badge
                  variant="destructive"
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider gap-1.5"
                >
                  <AlertTriangle className="size-3.5" />
                  <span>Declined</span>
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider gap-1.5">
                  <Clock className="size-3.5" />
                  <span>Pending Approval</span>
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
            {/* Security Explanation Box */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex items-start gap-3.5">
              <Lock className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold text-foreground">
                  Teacher Workspace Access is Restricted
                </p>
                <p className="text-muted-foreground">
                  To protect examination integrity and prevent unaccredited test creation, all faculty features (creating exams, managing questions, and viewing candidate submissions) remain locked until an administrator approves your institutional credentials.
                </p>
              </div>
            </div>

            {/* Application Progress Stepper */}
            {!isRejected && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Accreditation Timeline
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">1. Application</p>
                      <p className="text-[11px] text-muted-foreground">Submitted</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center gap-3">
                    <Clock className="size-5 text-amber-600 dark:text-amber-400 shrink-0 animate-spin" />
                    <div>
                      <p className="text-xs font-bold text-foreground">2. Admin Review</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">In Progress</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 flex items-center gap-3 opacity-60">
                    <Lock className="size-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">3. Workspace</p>
                      <p className="text-[11px] text-muted-foreground">Unlocks on Approval</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Note if rejected */}
            {isRejected && user.teacherVerificationNote && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:p-5 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-destructive">
                  Reviewer Notes:
                </p>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {user.teacherVerificationNote}
                </p>
              </div>
            )}

            {/* Submitted Profile Details Summary */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Submitted Application Details
              </h2>
              <div className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-muted/20 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Institution:</span>
                    <span className="font-semibold text-foreground truncate">
                      {user.institution || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-semibold text-foreground truncate">
                      {user.department || "Not specified"}
                    </span>
                  </div>
                </div>

                {user.bio && (
                  <>
                    <Separator className="bg-border/50" />
                    <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground block mb-0.5">
                        Background Statement:
                      </span>
                      {user.bio}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button asChild variant="outline" className="rounded-xl font-semibold w-full sm:w-auto h-11 border-border/70">
                <Link href="/teachers/apply">
                  <span>View / Edit Application</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>

              <Button asChild size="default" className="rounded-xl font-bold shadow-md w-full sm:w-auto h-11">
                <Link href="/dashboard">
                  <span>Go to Student Workspace</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  )
}
