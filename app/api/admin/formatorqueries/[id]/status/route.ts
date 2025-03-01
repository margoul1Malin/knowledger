import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { status, email } = await req.json()

    // Mettre à jour le statut de la demande
    const updatedQuery = await prisma.formatorQuery.update({
      where: { id: params.id },
      data: { status }
    })

    // Créer une notification en fonction du statut
    let notificationTitle = ''
    let notificationMessage = ''

    if (status === 'APPROVED') {
      notificationTitle = 'Candidature acceptée'
      notificationMessage = 'Votre candidature a été acceptée, un mail vous a été envoyé avec les détails relatifs à votre demande. Veuillez y répondre comme demandé dans ce dernier et votre statut sera mis à jour dans les plus brefs délai.'
    } else if (status === 'REJECTED') {
      notificationTitle = 'Candidature refusée'
      notificationMessage = 'Nous sommes désolés, mais votre candidature n\'a pas été retenue. Un email vous a été envoyé avec plus de détails sur cette décision.'
    }

    if (notificationTitle && notificationMessage) {
      // Trouver l'utilisateur par email s'il existe
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (user) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: status === 'APPROVED' ? 'FORMATOR_APPROVED' : 'FORMATOR_REJECTED',
            title: notificationTitle,
            message: notificationMessage,
            contentId: params.id,
            contentType: 'formator_query'
          }
        })
      }

      // Ici, vous pourriez ajouter l'envoi d'un email
      // await sendEmail(email, notificationTitle, notificationMessage)
    }

    return NextResponse.json(updatedQuery)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    )
  }
} 