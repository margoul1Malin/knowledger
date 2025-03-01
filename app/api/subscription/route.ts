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

    // Rechercher d'abord un abonnement actif
    let subscription = await prisma.subscription.findFirst({
      where: {
        user: { email: session.user.email },
        isActive: true
      }
    })

    // Si aucun abonnement actif n'est trouvé, rechercher le dernier abonnement résilié
    if (!subscription) {
      subscription = await prisma.subscription.findFirst({
        where: {
          user: { email: session.user.email }
        },
        orderBy: {
          cancelledAt: 'desc'
        }
      })
    }

    // Si aucun abonnement n'est trouvé du tout
    if (!subscription) {
      return NextResponse.json({
        status: 'NO_SUBSCRIPTION',
        message: 'Aucun abonnement trouvé'
      })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('[SUBSCRIPTION_GET]', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
} 