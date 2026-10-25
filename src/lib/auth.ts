import { getServerSession, type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { loginSchema } from "@/lib/validators"
import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/auth/password"
import { getClientIp } from "@/lib/auth/ip"
import { recordAuditEvent } from "@/lib/auth/audit"
import { isLoginRateLimited } from "@/lib/auth/rate-limit"
import type { Role } from "@/prisma/generated/prisma/client"

// Absolute session lifetime. Re-authentication is required after this even
// if the app is used continuously — a deliberate ceiling on how long a
// stolen session cookie stays useful.
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days

export const authOptions: NextAuthOptions = {
  pages: authConfig.pages,
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  jwt: { maxAge: SESSION_MAX_AGE_SECONDS },

  // Cookie flags (httpOnly, sameSite=lax, and secure once NEXTAUTH_URL is
  // https://) are NextAuth's own production-safe defaults — left as-is
  // deliberately rather than hand-rolled, to avoid misconfiguring them.

  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const ip = getClientIp(req.headers)

        if (await isLoginRateLimited(email, ip)) {
          await recordAuditEvent({
            action: "RATE_LIMITED",
            identifier: email,
            ip,
            metadata: { context: "login" },
          })
          return null
        }

        const user = await prisma.user.findUnique({ where: { email } })

        // Same generic failure for "no such user", "wrong password", and
        // "not verified yet" — don't let a login attempt reveal which.
        if (!user || !user.isActive || !user.isEmailVerified) {
          await recordAuditEvent({
            action: "LOGIN_FAILURE",
            success: false,
            identifier: email,
            ip,
          })
          return null
        }

        const valid = await verifyPassword(password, user.passwordHash)
        if (!valid) {
          await recordAuditEvent({
            action: "LOGIN_FAILURE",
            success: false,
            identifier: email,
            ip,
          })
          return null
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })
        await recordAuditEvent({
          action: "LOGIN_SUCCESS",
          identifier: email,
          ip,
          actorId: user.id,
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tokenVersion: user.tokenVersion,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tokenVersion = user.tokenVersion
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.tokenVersion = token.tokenVersion as number
      }
      return session
    },
  },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
}

export function auth() {
  return getServerSession(authOptions)
}
