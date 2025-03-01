import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia'
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'abonnement actif de l'utilisateur
    const subscription = await prisma.subscription.findFirst({
      where: {
        user: { email: session.user.email },
        isActive: true
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif trouvé' },
        { status: 404 }
      )
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Aucun abonnement Stripe trouvé' },
        { status: 400 }
      )
    }

    // Résilier l'abonnement Stripe
    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      })
    } catch (stripeError) {
      console.error('[STRIPE_CANCEL_ERROR]', stripeError)
      return NextResponse.json(
        { error: 'Erreur lors de la résiliation avec Stripe' },
        { status: 500 }
      )
    }

    // Marquer l'abonnement comme résilié dans notre base de données
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        isActive: false,
        cancelledAt: new Date()
      }
    })

    // Créer une notification pour l'utilisateur
    await prisma.notification.create({
      data: {
        userId: subscription.userId,
        type: 'PREMIUM_UPGRADE',
        title: 'Résiliation confirmée',
        message: `Votre abonnement premium restera actif jusqu'au ${new Date(subscription.endDate).toLocaleDateString('fr-FR')}. Vous pouvez continuer à profiter de tous les avantages premium jusqu'à cette date.`
      }
    })

    return NextResponse.json({
      message: 'Abonnement résilié avec succès',
      endDate: subscription.endDate
    })
  } catch (error) {
    console.error('[SUBSCRIPTION_CANCEL]', error)
    return NextResponse.json(
      { error: 'Erreur lors de la résiliation' },
      { status: 500 }
    )
  }
} 