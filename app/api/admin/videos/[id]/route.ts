import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Supprimer les relations VideoFormation
    await prisma.videoFormation.deleteMany({
      where: { videoId: params.id }
    })

    // Supprimer les achats
    await prisma.purchase.deleteMany({
      where: { 
        itemId: params.id,
        type: 'video'
      }
    })

    // Supprimer l'historique
    await prisma.history.deleteMany({
      where: {
        itemId: params.id,
        type: 'video'
      }
    })

    // Supprimer les commentaires
    await prisma.comment.deleteMany({
      where: {
        itemId: params.id,
        itemType: 'video'
      }
    })

    // Supprimer les notifications
    await prisma.notification.deleteMany({
      where: {
        contentId: params.id,
        contentType: 'video'
      }
    })

    // Supprimer la vidéo
    await prisma.video.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
} 