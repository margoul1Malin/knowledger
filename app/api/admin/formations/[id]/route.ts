import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la formation avec ses vidéos
    const formation = await prisma.formation.findUnique({
      where: { id: params.id },
      include: {
        videos: {
          include: {
            video: true
          }
        }
      }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    // Récupérer les IDs des vidéos à supprimer
    const videoIds = formation.videos.map(v => v.videoId)

    // Supprimer d'abord toutes les relations VideoFormation pour ces vidéos
    await prisma.videoFormation.deleteMany({
      where: {
        videoId: {
          in: videoIds
        }
      }
    })

    // Supprimer les vidéos
    await prisma.video.deleteMany({
      where: {
        id: {
          in: videoIds
        }
      }
    })

    // Supprimer les achats liés à la formation
    await prisma.purchase.deleteMany({
      where: {
        itemId: params.id,
        type: 'formation'
      }
    })

    // Supprimer l'historique lié à la formation
    await prisma.history.deleteMany({
      where: {
        itemId: params.id,
        type: 'formation'
      }
    })

    // Supprimer les commentaires liés à la formation
    await prisma.comment.deleteMany({
      where: {
        itemId: params.id,
        itemType: 'formation'
      }
    })

    // Supprimer les notifications liées à la formation
    await prisma.notification.deleteMany({
      where: {
        contentId: params.id,
        contentType: 'formation'
      }
    })

    // Enfin, supprimer la formation
    await prisma.formation.delete({
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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formation = await prisma.formation.findUnique({
      where: { id: params.id }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    return NextResponse.json(formation)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    )
  }
} 