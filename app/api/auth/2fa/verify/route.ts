import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isCodeValid } from '@/lib/2fa'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { code } = await req.json()

    // Récupérer le code 2FA de l'utilisateur
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId: session.user.id }
    })

    if (!twoFactorAuth) {
      return NextResponse.json(
        { error: 'Code 2FA non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le code n'est pas expiré
    if (!isCodeValid(twoFactorAuth.expiresAt)) {
      return NextResponse.json(
        { error: 'Code expiré' },
        { status: 400 }
      )
    }

    // Vérifier que le code est correct
    if (twoFactorAuth.secret !== code) {
      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      )
    }

    // Marquer le code comme vérifié et activer la 2FA
    await prisma.twoFactorAuth.update({
      where: { userId: session.user.id },
      data: { verified: true }
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur vérification 2FA:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
} 