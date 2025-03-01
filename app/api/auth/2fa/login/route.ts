import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isCodeValid } from '@/lib/2fa'

export async function POST(req: Request) {
  try {
    const { code, email } = await req.json()

    if (!code || !email) {
      return NextResponse.json(
        { error: 'Code et email requis' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur et son code 2FA
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        twoFactorAuth: true
      }
    })

    if (!user || !user.twoFactorAuth) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou 2FA non configurée' },
        { status: 404 }
      )
    }

    // Vérifier que le code n'est pas expiré
    if (!isCodeValid(user.twoFactorAuth.expiresAt)) {
      return NextResponse.json(
        { error: 'Code expiré' },
        { status: 400 }
      )
    }

    // Vérifier que le code est correct
    if (user.twoFactorAuth.secret !== code) {
      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      )
    }

    // Marquer le code comme vérifié
    await prisma.twoFactorAuth.update({
      where: { userId: user.id },
      data: { verified: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur vérification 2FA login:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
} 