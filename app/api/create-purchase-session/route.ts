import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { type, itemId } = await req.json()

    // Vérifier si l'item existe et récupérer ses informations
    let item
    switch (type) {
      case 'article':
        item = await prisma.article.findUnique({ where: { id: itemId } })
        break
      case 'video':
        item = await prisma.video.findUnique({ where: { id: itemId } })
        break
      case 'formation':
        item = await prisma.formation.findUnique({ 
          where: { id: itemId },
          include: { videos: true }
        })
        break
      default:
        throw new Error('Type invalide')
    }

    if (!item || !item.price) {
      throw new Error('Item non trouvé ou sans prix')
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.title,
              description: type === 'formation' 
                ? 'Inclut toutes les vidéos de la formation'
                : undefined
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/profile?purchase_success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/profile?purchase_canceled=true`,
      metadata: {
        userId: session.user.id,
        itemId,
        type
      }
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Erreur création session:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
} 