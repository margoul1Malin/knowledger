import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateTwoFactorCode, sendTwoFactorCodeByEmail, sendTwoFactorCodeBySMS } from '@/lib/2fa'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { method, phoneNumber } = await req.json()

    // Vérifier que la méthode est valide
    if (!['EMAIL', 'PHONE'].includes(method)) {
      return NextResponse.json(
        { error: 'Méthode 2FA invalide' },
        { status: 400 }
      )
    }

    // Si méthode SMS, vérifier le numéro de téléphone
    if (method === 'PHONE' && !phoneNumber) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      )
    }

    // Générer un nouveau code
    const code = generateTwoFactorCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // Expire dans 10 minutes

    // Sauvegarder le code dans la base de données
    await prisma.twoFactorAuth.upsert({
      where: { userId: session.user.id },
      update: {
        secret: code,
        expiresAt,
        verified: false
      },
      create: {
        userId: session.user.id,
        secret: code,
        expiresAt,
        verified: false
      }
    })

    // Mettre à jour les préférences 2FA de l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorMethod: method,
        phoneNumber: method === 'PHONE' ? phoneNumber : undefined
      }
    })

    // Envoyer le code selon la méthode choisie
    let sent = false
    if (method === 'EMAIL') {
      sent = await sendTwoFactorCodeByEmail(session.user.email!, code)
    } else if (method === 'PHONE') {
      sent = await sendTwoFactorCodeBySMS(phoneNumber, code)
    }

    if (!sent) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du code' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur setup 2FA:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la configuration' },
      { status: 500 }
    )
  }
} 