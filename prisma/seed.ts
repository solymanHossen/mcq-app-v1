import "dotenv/config"
import { prisma } from "../lib/db"
import { hashPassword } from "../lib/auth/password"

async function upsertVerifiedUser(
  email: string,
  name: string,
  role: "ADMIN" | "TEACHER" | "STUDENT"
) {
  const passwordHash = await hashPassword("Password123!")
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role, isEmailVerified: true },
  })
  console.log(`${role}: ${user.email} / Password123!`)
}

async function main() {
  await upsertVerifiedUser("admin@example.com", "Admin User", "ADMIN")
  await upsertVerifiedUser("teacher@example.com", "Teacher User", "TEACHER")
  await upsertVerifiedUser("student@example.com", "Student User", "STUDENT")
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
