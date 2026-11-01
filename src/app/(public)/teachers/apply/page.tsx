import type { Metadata } from "next"
import { connection } from "next/server"
import { getCurrentUser } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { APP_NAME } from "@/lib/config"
import { TeacherApplyClient } from "./teacher-apply-client"

export const metadata: Metadata = {
  title: `Apply as Faculty Instructor — ${APP_NAME}`,
  description:
    "Apply to become a verified teacher or examiner on ExamHub. Host timed assessments, create question banks, and evaluate candidate performance.",
}

// @next-codemod-ignore Cache Components adoption
export const instant = false

export default async function TeacherApplyPage() {
  await connection()
  const currentUser = await getCurrentUser()

  let userDetails: {
    id: string
    name: string
    email: string
    role: string
    teacherVerificationStatus: string
    institution: string | null
    department: string | null
    bio: string | null
  } | null = null

  if (currentUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teacherVerificationStatus: true,
        institution: true,
        department: true,
        bio: true,
      },
    })

    if (dbUser) {
      userDetails = dbUser
    }
  }

  return (
    <div className="pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <TeacherApplyClient currentUser={userDetails} />
      </div>
    </div>
  )
}
