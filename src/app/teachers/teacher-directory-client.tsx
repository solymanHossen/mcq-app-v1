"use client"

import * as React from "react"
import Link from "next/link"
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Filter,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { TeacherItem } from "./page"

const CATEGORIES = [
  "All",
  "Computer Science",
  "Mathematics",
  "Data Science",
  "Physics",
  "Business",
] as const

interface TeacherDirectoryClientProps {
  initialTeachers: TeacherItem[]
}

export function TeacherDirectoryClient({ initialTeachers }: TeacherDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All")

  const filteredTeachers = React.useMemo(() => {
    return initialTeachers.filter((teacher) => {
      const matchesCategory =
        selectedCategory === "All" || teacher.department === selectedCategory

      const query = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.title.toLowerCase().includes(query) ||
        teacher.department.toLowerCase().includes(query) ||
        teacher.institution.toLowerCase().includes(query) ||
        teacher.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        teacher.bio.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [initialTeachers, searchTerm, selectedCategory])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* ================= PAGE HERO HEADER ================= */}
      <div className="relative mx-auto max-w-4xl text-center pb-12 sm:pb-16">
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
        />

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary mb-6 shadow-2xs">
          <GraduationCap className="size-4" />
          <span>Verified Educators &amp; Examiners</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
          Connect with elite{" "}
          <span className="text-primary">academic examiners</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Browse verified professors, department heads, and certified testing coordinators administering secure online exams and standardized MCQ assessments.
        </p>

        {/* Global Directory Metrics Strip */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 text-center backdrop-blur-xs shadow-xs">
            <span className="block font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              500+
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Certified Instructors
            </span>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 text-center backdrop-blur-xs shadow-xs">
            <span className="block font-heading text-2xl sm:text-3xl font-extrabold text-primary">
              2,800+
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Active Exams
            </span>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 text-center backdrop-blur-xs shadow-xs">
            <span className="block font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              4.9 / 5
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Student Rating
            </span>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 text-center backdrop-blur-xs shadow-xs">
            <span className="block font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              100%
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Proctored Security
            </span>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTER CONTROL BAR ================= */}
      <div className="mx-auto max-w-5xl mb-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by teacher name, subject, topic, or university..."
              className="w-full rounded-2xl border border-border/80 bg-card px-11 py-3.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs sm:text-sm text-muted-foreground">
            <Filter className="size-4" />
            <span>Showing <strong className="text-foreground">{filteredTeachers.length}</strong> teachers</span>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap active:scale-95 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border/70 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TEACHERS GRID ================= */}
      <div className="mx-auto max-w-5xl">
        {filteredTeachers.length === 0 ? (
          <div className="rounded-3xl border border-border/80 bg-card/60 p-12 text-center shadow-xs">
            <Users className="mx-auto size-12 text-muted-foreground/60 mb-4" />
            <h3 className="font-heading text-xl font-bold text-foreground">
              No teachers found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t find any instructors matching &ldquo;{searchTerm}&rdquo;. Try adjusting your search keywords or category filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("All")
              }}
              className="mt-6 rounded-full"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Card
                key={teacher.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                <div>
                  {/* Top Header: Avatar & Verified Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${teacher.avatarGradient} text-white font-heading text-lg font-bold shadow-md transition-transform duration-300 group-hover:scale-105`}
                    >
                      {teacher.initials}
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="size-3.5 stroke-[2.5]" />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {teacher.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary/90 mt-0.5">
                    {teacher.title}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mb-3">
                    {teacher.institution}
                  </p>

                  {/* Bio */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                    {teacher.bio}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {teacher.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Stats & Action */}
                <div>
                  <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3.5 mb-4 text-center">
                    <div>
                      <span className="block font-heading text-sm font-bold text-foreground">
                        {teacher.examCount}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                        <ClipboardList className="size-3" /> Exams
                      </span>
                    </div>
                    <div>
                      <span className="block font-heading text-sm font-bold text-foreground">
                        {teacher.questionCount}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                        <BookOpen className="size-3" /> MCQs
                      </span>
                    </div>
                    <div>
                      <span className="block font-heading text-sm font-bold text-foreground">
                        {teacher.rating}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                        <Star className="size-3 text-amber-500 fill-amber-500" /> Score
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/register?role=student&ref=${encodeURIComponent(teacher.id)}`}
                    className="group/btn flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary px-4 text-xs font-semibold text-primary hover:text-primary-foreground transition-all duration-200 active:scale-95 shadow-2xs"
                  >
                    <span>View Examination Tracks</span>
                    <ChevronRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ================= INSTRUCTOR CTA SECTION ================= */}
      <div className="mx-auto max-w-5xl mt-20">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-r from-primary/10 via-card to-chart-2/10 p-8 sm:p-12 text-center shadow-md">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4 shadow-sm">
            <Sparkles className="size-6" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Are you an academic educator or examiner?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Join 500+ verified faculty members using ExamHub to author reusable question banks, configure biometric proctoring, and grade exams automatically.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register?role=teacher"
              className="rounded-full bg-primary hover:bg-primary/90 px-7 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all active:scale-95"
            >
              Apply as Verified Examiner
            </Link>
            <Link
              href="/#features"
              className="rounded-full border border-border bg-card px-7 py-3 text-sm font-medium text-foreground hover:bg-muted transition-all active:scale-95"
            >
              Explore Educator Features
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
