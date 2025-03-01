import { NextAuthOptions, Session, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "./prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
import { generateTwoFactorCode, sendTwoFactorCodeByEmail } from "@/lib/2fa"

// Types personnalisés pour la 2FA
type UserWith2FA = {
  id: string
  email: string
  requires2FA: true
}

type UserWithoutFA = {
  id: string
  email: string
  name: string
  image: string | null
  role: UserRole
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify'
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "Two Factor Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        // Si un code 2FA est fourni, vérifier directement
        if (credentials.twoFactorCode) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              twoFactorAuth: true
            }
          })

          if (!user?.twoFactorAuth?.verified) {
            throw new Error('Code 2FA non vérifié')
          }

          return user
        }

        // Authentification normale
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            image: true,
            role: true,
            twoFactorEnabled: true,
            twoFactorAuth: true
          }
        })

        if (!user || !user.password) {
          throw new Error('Email ou mot de passe incorrect')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Email ou mot de passe incorrect')
        }

        if (user.twoFactorEnabled) {
          const code = generateTwoFactorCode()
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

          await prisma.twoFactorAuth.upsert({
            where: { userId: user.id },
            update: {
              secret: code,
              expiresAt,
              verified: false
            },
            create: {
              userId: user.id,
              secret: code,
              expiresAt,
              verified: false
            }
          })

          await sendTwoFactorCodeByEmail(user.email, code)
          console.log("📧 Code 2FA envoyé par email")

          // Inclure le mot de passe encodé dans l'URL
          const encodedPassword = Buffer.from(credentials.password).toString('base64')
          throw new Error(`/auth/verify?email=${encodeURIComponent(user.email)}&p=${encodedPassword}`)
        }

        return user
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isCredentialsCallback = account?.type === "credentials"
      if (isCredentialsCallback) {
        return true
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.email = token.email as string
      session.user.name = token.name as string
      session.user.image = token.image as string | null
      session.user.role = token.role as UserRole
      return session
    },
    async redirect({ url, baseUrl }) {
      // Si l'URL contient /auth/verify, c'est une redirection 2FA
      if (url.startsWith('/auth/verify')) {
        return `${baseUrl}${url}`
      }
      // Pour toute autre URL, vérifier si elle commence par baseUrl
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    }
  }
}
