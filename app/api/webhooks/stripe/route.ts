import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not defined')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia'
})

const isDevelopment = process.env.NODE_ENV === 'development'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    console.log('Webhook reçu - Signature:', signature)
    console.log('Secret webhook:', process.env.STRIPE_WEBHOOK_SECRET)

    if (!signature) {
      console.error('Pas de signature Stripe')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      // En développement, on utilise une tolérance de 5 minutes
      const tolerance = isDevelopment ? 5 * 60 * 1000 : undefined // 5 minutes en millisecondes
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
        tolerance
      )
      console.log('Événement construit avec succès:', event.type)
    } catch (err) {
      console.error('Erreur construction webhook:', err)
      return NextResponse.json(
        { error: `Webhook error: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      )
    }

    try {
      console.log('Traitement événement:', event.type, 'Data:', JSON.stringify(event.data.object))
      
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session
          console.log('Session complétée - Mode:', session.mode, 'Metadata:', session.metadata)

          if (session.mode === 'subscription') {
            // Gestion abonnement Premium
            await prisma.user.update({
              where: { id: session.metadata?.userId },
              data: { role: 'PREMIUM' }
            })

            // Notification pour l'upgrade premium
            await prisma.notification.create({
              data: {
                userId: session.metadata?.userId!,
                type: 'PREMIUM_UPGRADE',
                title: 'Bienvenue dans Premium !',
                message: 'Vous avez maintenant accès à tout le contenu premium. Profitez-en !',
              }
            })
          } else if (session.mode === 'payment') {
            // Gestion achat unique
            const { userId, itemId, type } = session.metadata || {}
            
            if (type === 'formation') {
              // Pour une formation, rendre toutes ses vidéos accessibles
              const formation = await prisma.formation.findUnique({
                where: { id: itemId },
                include: { videos: true }
              })

              if (formation) {
                await prisma.$transaction([
                  // Créer l'achat de la formation
                  prisma.purchase.create({
                    data: {
                      type,
                      itemId,
                      userId,
                      price: formation.price || 0
                    }
                  }),
                  // Créer les achats pour chaque vidéo de la formation
                  ...formation.videos.map(videoFormation => 
                    prisma.purchase.create({
                      data: {
                        type: 'video',
                        itemId: videoFormation.videoId,
                        userId,
                        price: 0 // Gratuit car inclus dans la formation
                      }
                    })
                  ),
                  // Créer une notification pour l'achat
                  prisma.notification.create({
                    data: {
                      userId,
                      type: 'PURCHASE',
                      title: 'Formation achetée',
                      message: `Vous avez acheté la formation "${formation.title}". Bonne formation !`,
                      contentId: itemId,
                      contentType: 'formation'
                    }
                  })
                ])
              }
            } else {
              // Pour article ou vidéo unique
              const [content, notification] = await prisma.$transaction([
                // Créer l'achat
                prisma.purchase.create({
                  data: {
                    type,
                    itemId,
                    userId,
                    price: session.amount_total ? session.amount_total / 100 : 0
                  }
                }),
                // Créer une notification
                prisma.notification.create({
                  data: {
                    userId,
                    type: 'PURCHASE',
                    title: type === 'article' ? 'Article acheté' : 'Vidéo achetée',
                    message: `Vous avez acheté ${type === 'article' ? 'l\'article' : 'la vidéo'}. Bon visionnage !`,
                    contentId: itemId,
                    contentType: type
                  }
                })
              ])
            }
          }

          console.log('Session complétée:', session)
          console.log('Métadonnées:', session.metadata)
          break

        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription
          
          // Retrouver l'utilisateur via la session de paiement
          const checkoutSession = await stripe.checkout.sessions.retrieve(
            subscription.metadata?.checkout_session_id as string
          )
          
          if (checkoutSession.metadata?.userId) {
            // Rétrograder l'utilisateur en NORMAL
            await prisma.user.update({
              where: { id: checkoutSession.metadata.userId },
              data: { role: 'NORMAL' }
            })

            // Notification pour l'annulation de l'abonnement
            await prisma.notification.create({
              data: {
                userId: checkoutSession.metadata.userId,
                type: 'PREMIUM_UPGRADE',
                title: 'Abonnement Premium terminé',
                message: 'Votre abonnement Premium est arrivé à son terme. Vous pouvez le renouveler à tout moment.',
              }
            })
          }
          break
      }

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('Erreur traitement webhook:', error)
      return NextResponse.json(
        { error: `Webhook handler failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur globale webhook:', error)
    return NextResponse.json(
      { error: `Global webhook error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 