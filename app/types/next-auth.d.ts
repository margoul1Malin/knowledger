import { UserRole } from "@prisma/client"
import "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name?: string
    image?: string | null
    role?: UserRole
    requires2FA?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string | null
      role?: UserRole
      requires2FA?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    email?: string
    name?: string
    image?: string | null
    role?: UserRole
    requires2FA?: boolean
  }
} 