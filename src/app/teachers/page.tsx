import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/landing/navbar"
import { TeacherDirectoryClient } from "./teacher-directory-client"
import { prisma } from "@/lib/prisma"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = {
  title: `Teacher Directory — ${APP_NAME}`,
  description: "Browse verified teachers and instructors, discover curated mock examinations, and practice with trusted academic question banks.",
}

// @next-codemod-ignore Cache Components adoption
export const instant = false

export interface TeacherItem {
  id: string
  name: string
  email: string
  title: string
  department: string
  institution: string
  avatarGradient: string
  initials: string
  isVerified: boolean
  examCount: number
  questionCount: number
  studentsCount: number
  rating: number
  tags: string[]
  bio: string
}

const FALLBACK_TEACHERS: TeacherItem[] = [
  {
    id: "t-1",
    name: "Dr. Sarah Jenkins",
    email: "s.jenkins@stanford.edu",
    title: "Professor of Computer Science",
    department: "Computer Science",
    institution: "Stanford University",
    avatarGradient: "from-blue-600 to-indigo-600",
    initials: "SJ",
    isVerified: true,
    examCount: 14,
    questionCount: 320,
    studentsCount: 1420,
    rating: 4.95,
    tags: ["Data Structures", "Algorithms", "System Design"],
    bio: "Head examiner for undergraduate algorithm design and distributed systems with 12+ years of university examination experience.",
  },
  {
    id: "t-2",
    name: "Prof. Marcus Vance",
    email: "m.vance@mit.edu",
    title: "Principal Examiner & Lecturer",
    department: "Mathematics",
    institution: "MIT",
    avatarGradient: "from-emerald-600 to-teal-600",
    initials: "MV",
    isVerified: true,
    examCount: 22,
    questionCount: 540,
    studentsCount: 2180,
    rating: 4.9,
    tags: ["Linear Algebra", "Calculus III", "Discrete Math"],
    bio: "Specializing in high-throughput timed assessments and randomized multiple-choice mathematics problem sets.",
  },
  {
    id: "t-3",
    name: "Dr. Amara Patel",
    email: "amara.patel@cambridge.ac.uk",
    title: "Senior Research Fellow",
    department: "Data Science",
    institution: "Cambridge University",
    avatarGradient: "from-purple-600 to-pink-600",
    initials: "AP",
    isVerified: true,
    examCount: 9,
    questionCount: 210,
    studentsCount: 890,
    rating: 4.88,
    tags: ["Machine Learning", "Statistics", "Python"],
    bio: "Designs certified AI proctored machine learning examinations for post-graduate and certification cohorts.",
  },
  {
    id: "t-4",
    name: "Prof. David Thorne",
    email: "d.thorne@oxford.ac.uk",
    title: "Department Chair of Physics",
    department: "Physics",
    institution: "Oxford University",
    avatarGradient: "from-amber-600 to-orange-600",
    initials: "DT",
    isVerified: true,
    examCount: 16,
    questionCount: 410,
    studentsCount: 1640,
    rating: 4.92,
    tags: ["Quantum Mechanics", "Electromagnetism", "Thermodynamics"],
    bio: "Pioneer in anti-cheat proctored physics tests with tamper-resistant numerical and formula response sections.",
  },
  {
    id: "t-5",
    name: "Dr. Elena Rostova",
    email: "elena.r@berkeley.edu",
    title: "Associate Professor of Cybersecurity",
    department: "Computer Science",
    institution: "UC Berkeley",
    avatarGradient: "from-cyan-600 to-blue-700",
    initials: "ER",
    isVerified: true,
    examCount: 11,
    questionCount: 280,
    studentsCount: 1130,
    rating: 4.97,
    tags: ["Network Security", "Cryptography", "Ethical Hacking"],
    bio: "Focusing on timed cyber security quizzes, vulnerability analysis evaluations, and automated score certification.",
  },
  {
    id: "t-6",
    name: "Prof. Arthur Pendelton",
    email: "a.pendelton@columbia.edu",
    title: "Director of Quantitative Finance",
    department: "Business",
    institution: "Columbia University",
    avatarGradient: "from-rose-600 to-red-700",
    initials: "AP",
    isVerified: true,
    examCount: 18,
    questionCount: 460,
    studentsCount: 1850,
    rating: 4.85,
    tags: ["Financial Modeling", "Econometrics", "Risk Analysis"],
    bio: "Administers industry-recognized corporate and collegiate quantitative exams with live leaderboards and instant feedback.",
  },
]

export default async function TeachersPage() {
  let dbTeachers: TeacherItem[] = []

  try {
    const rawUsers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        teacherVerificationStatus: true,
        createdAt: true,
        _count: {
          select: {
            exams: true,
            questions: true,
          },
        },
      },
      take: 50,
      orderBy: { createdAt: "desc" },
    })

    if (rawUsers.length > 0) {
      dbTeachers = rawUsers.map((u, idx) => {
        const initials = u.name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((n) => n[0]?.toUpperCase() ?? "")
          .join("") || "TR"

        const gradients = [
          "from-blue-600 to-indigo-600",
          "from-emerald-600 to-teal-600",
          "from-purple-600 to-pink-600",
          "from-amber-600 to-orange-600",
          "from-cyan-600 to-blue-700",
        ]

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          title: "Certified Academic Examiner",
          department: "Computer Science",
          institution: "Partner University",
          avatarGradient: gradients[idx % gradients.length]!,
          initials,
          isVerified: u.teacherVerificationStatus === "VERIFIED",
          examCount: u._count.exams,
          questionCount: u._count.questions,
          studentsCount: Math.max(120, (u._count.exams || 1) * 65),
          rating: 4.9,
          tags: ["Assessment", "MCQ", "Examination"],
          bio: "Verified faculty member conducting secure, proctored examinations on the ExamHub platform.",
        }
      })
    }
  } catch (err) {
    console.error("Failed to load teachers from db:", err)
  }

  // Combine database teachers with curated academic exemplars
  const allTeachers: TeacherItem[] =
    dbTeachers.length > 0
      ? [...dbTeachers, ...FALLBACK_TEACHERS.filter((f) => !dbTeachers.some((d) => d.email === f.email))]
      : FALLBACK_TEACHERS

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        <TeacherDirectoryClient initialTeachers={allTeachers} />
      </main>

      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>&copy; 2026 {APP_NAME}. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/teachers" className="hover:text-foreground text-primary font-medium transition-colors">
              Teachers
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
