import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const session = event.data.object as Stripe.Checkout.Session

  switch (event.type) {
    case 'checkout.session.completed':
      // Mettre à jour le rôle de l'utilisateur
      await prisma.user.update({
        where: { id: session.metadata?.userId },
        data: { role: 'PREMIUM' }
      })
      break

    case 'customer.subscription.deleted':
      // Rétrograder l'utilisateur
      await prisma.user.update({
        where: { id: session.metadata?.userId },
        data: { role: 'NORMAL' }
      })
      break
  }

  return NextResponse.json({ received: true })
} 