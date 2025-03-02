import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'utilisateur avec son rôle
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Si l'utilisateur est ADMIN ou FORMATOR, il a accès à tout
    if (user.role === 'ADMIN' || user.role === 'FORMATOR') {
      return NextResponse.json({
        role: user.role,
        hasPremiumAccess: true,
        subscription: null
      })
    }

    // Pour les utilisateurs normaux, rechercher leur abonnement actif
    const subscription = await prisma.subscription.findFirst({
      where: {
        user: { email: session.user.email },
        OR: [
          { isActive: true },
          { cancelledAt: { not: null } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        endDate: true,
        isActive: true,
        plan: true,
        cancelledAt: true
      }
    })

    return NextResponse.json({
      role: user.role,
      hasPremiumAccess: subscription?.isActive ?? false,
      subscription: subscription
    })
  } catch (error) {
    console.error('[SUBSCRIPTION_GET]', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
} 