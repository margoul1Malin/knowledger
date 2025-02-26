import { DefaultSession } from 'next-auth'

export enum UserRole {
  ADMIN = 'ADMIN',
  FORMATOR = 'FORMATOR',
  PREMIUM = 'PREMIUM',
  NORMAL = 'NORMAL'
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
} 