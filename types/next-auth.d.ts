import "next-auth"
import "next-auth/jwt"
import type { Role } from "@/prisma/generated/prisma/client"

declare module "next-auth" {
  interface User {
    role: Role
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
  }
}
