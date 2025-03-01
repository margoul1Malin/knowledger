import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateTwoFactorCode, sendTwoFactorCodeByEmail } from '@/lib/2fa'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        twoFactorEnabled: true
      }
    })

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou 2FA non activée' },
        { status: 404 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      )
    }

    // Générer un nouveau code
    const code = generateTwoFactorCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // Expire dans 10 minutes

    // Sauvegarder le nouveau code
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

    // Envoyer le code par email
    const sent = await sendTwoFactorCodeByEmail(email, code)

    if (!sent) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du code' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur renvoi code 2FA:', error)
    return NextResponse.json(
      { error: 'Erreur lors du renvoi du code' },
      { status: 500 }
    )
  }
} 