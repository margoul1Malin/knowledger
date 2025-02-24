import 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }

  interface JWT {
    role?: UserRole
    sub?: string
  }

  interface User {
    role: UserRole
  }
} 