import "next-auth"
import "next-auth/jwt"
import type { Role } from "@/prisma/generated/prisma/client"

declare module "next-auth" {
  interface User {
    role: Role
    tokenVersion: number
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      // Convenience only — not trusted for authorization decisions. Every
      // guard in lib/auth/guards.ts re-reads the real role from the DB.
      role: Role
      tokenVersion: number
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    tokenVersion: number
  }
}
