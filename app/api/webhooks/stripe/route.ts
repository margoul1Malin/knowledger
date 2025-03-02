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
  apiVersion: '2025-02-24.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const isDevelopment = process.env.NODE_ENV === 'development'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')

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
      
      // En développement, on peut bypasser la vérification de la signature
      if (isDevelopment && process.env.SKIP_WEBHOOK_SIGNATURE === 'true') {
        event = {
          type: JSON.parse(body).type,
          data: {
            object: JSON.parse(body).data.object
          }
        } as Stripe.Event
        console.log('Mode développement : signature bypassed')
      } else {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          webhookSecret,
          tolerance
        )
      }
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
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          if (!session?.metadata?.userId) break

          // Récupérer les détails de l'abonnement
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Calculer la date de fin
          const endDate = new Date(subscription.current_period_end * 1000)

          // Déterminer le plan en fonction de l'intervalle
          const interval = subscription.items.data[0].price.recurring?.interval
          let plan = 'MONTHLY'
          if (interval === 'year') {
            plan = 'YEARLY'
          } else if (interval === 'day') {
            plan = 'DAILY'
          }

          // Mettre à jour ou créer l'abonnement dans notre base de données
          await prisma.subscription.upsert({
            where: {
              userId: session.metadata.userId
            },
            update: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCustomerId: subscription.customer as string,
              endDate: endDate,
              isActive: true,
              plan: plan
            },
            create: {
              userId: session.metadata.userId,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCustomerId: subscription.customer as string,
              endDate: endDate,
              isActive: true,
              plan: plan
            }
          })

          // Mettre à jour le rôle de l'utilisateur
          await prisma.user.update({
            where: { id: session.metadata.userId },
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

          console.log('Session complétée:', session)
          console.log('Métadonnées:', session.metadata)
          break
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          
          // Mettre à jour l'abonnement dans notre base de données
          await prisma.subscription.update({
            where: {
              stripeSubscriptionId: subscription.id
            },
            data: {
              endDate: new Date(subscription.current_period_end * 1000),
              isActive: subscription.status === 'active',
              cancelledAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null
            }
          })

          break
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          console.log('Subscription deleted event received:', subscription.id)

          try {
            // D'abord vérifier si l'abonnement existe
            const existingSubscription = await prisma.subscription.findUnique({
              where: {
                stripeSubscriptionId: subscription.id
              },
              include: {
                user: true
              }
            })

            if (!existingSubscription) {
              console.error('Subscription not found in database:', subscription.id)
              return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
            }

            // Mettre à jour l'abonnement
            const dbSubscription = await prisma.subscription.update({
              where: {
                stripeSubscriptionId: subscription.id
              },
              data: {
                isActive: false,
                cancelledAt: new Date()
              },
              include: {
                user: true
              }
            })

            console.log('Subscription updated, updating user role...')

            // Rétrograder l'utilisateur en compte normal
            await prisma.user.update({
              where: { id: dbSubscription.user.id },
              data: { role: 'NORMAL' }
            })

            console.log('User role updated, creating notification...')

            // Notification pour l'annulation de l'abonnement
            await prisma.notification.create({
              data: {
                userId: dbSubscription.user.id,
                type: 'PREMIUM_UPGRADE',
                title: 'Abonnement Premium terminé',
                message: 'Votre abonnement Premium est arrivé à son terme. Vous pouvez le renouveler à tout moment.',
              }
            })

            console.log('Webhook processing completed successfully')
            return NextResponse.json({ success: true })
          } catch (error) {
            console.error('Error processing subscription deletion:', error)
            return NextResponse.json(
              { error: `Error processing subscription deletion: ${error instanceof Error ? error.message : 'Unknown error'}` },
              { status: 500 }
            )
          }

          break
        }
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