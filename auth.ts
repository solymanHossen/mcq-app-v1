import { getServerSession, type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { loginSchema } from "@/lib/validators"
import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/auth/password"
import type { Role } from "@/prisma/generated/prisma/client"

export const authOptions: NextAuthOptions = {
  pages: authConfig.pages,
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        // Same generic failure for "no such user", "wrong password", and
        // "not verified yet" — don't let a login attempt reveal which.
        if (!user || !user.isActive || !user.isEmailVerified) return null

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash
        )
        if (!valid) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
}

export function auth() {
  return getServerSession(authOptions)
}
