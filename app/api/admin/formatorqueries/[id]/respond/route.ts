import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import prisma from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { message, email, firstName, lastName, status } = await req.json()

    if (!message || !email || !firstName || !lastName || !status) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Envoyer l'email
    const emailSent = await sendEmail(
      email,
      'Réponse à votre demande de formateur - KnowLedger',
      'FORMATOR_RESPONSE',
      {
        firstName,
        lastName,
        message,
        status: status as 'APPROVED' | 'REJECTED' | 'PENDING'
      }
    )

    if (!emailSent) {
      throw new Error('Failed to send email')
    }

    // Mettre à jour le message de la demande pour inclure la réponse
    await prisma.formatorQuery.update({
      where: { id: params.id },
      data: {
        message: `${message}\n\n--- Réponse envoyée le ${new Date().toLocaleDateString()} ---`
      }
    })

    return new NextResponse('Email sent successfully', { status: 200 })
  } catch (error) {
    console.error('Error sending response:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 