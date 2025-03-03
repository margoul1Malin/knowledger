import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary-config'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la formation avec ses vidéos et tous les publicId
    const formation = await prisma.formation.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        imagePublicId: true,
        videos: {
          select: {
            video: {
              select: {
                id: true,
                videoPublicId: true,
                coverImagePublicId: true
              }
            }
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

    // Collecter tous les publicId à supprimer
    const resourcesToDelete: Array<{ publicId: string, resourceType: 'image' | 'video' }> = []

    // Ajouter l'image de la formation
    if (formation.imagePublicId) {
      resourcesToDelete.push({
        publicId: formation.imagePublicId,
        resourceType: 'image'
      })
    }

    // Ajouter les vidéos et leurs images de couverture
    formation.videos.forEach(videoFormation => {
      const video = videoFormation.video
      if (video.videoPublicId) {
        resourcesToDelete.push({
          publicId: video.videoPublicId,
          resourceType: 'video'
        })
      }
      if (video.coverImagePublicId) {
        resourcesToDelete.push({
          publicId: video.coverImagePublicId,
          resourceType: 'image'
        })
      }
    })

    // Supprimer toutes les ressources de Cloudinary
    try {
      console.log('Ressources à supprimer:', resourcesToDelete)
      for (const resource of resourcesToDelete) {
        if (!resource.publicId) continue
        
        console.log(`Suppression de la ressource Cloudinary (${resource.resourceType}):`, resource.publicId)
        await cloudinary.uploader.destroy(resource.publicId, {
          resource_type: resource.resourceType
        })
      }
    } catch (cloudinaryError) {
      console.error('Erreur lors de la suppression Cloudinary:', cloudinaryError)
    }

    // Récupérer les IDs des vidéos à supprimer
    const videoIds = formation.videos.map(v => v.video.id)

    // Supprimer toutes les relations et données en une seule transaction
    await prisma.$transaction([
      // Supprimer les relations VideoFormation
      prisma.videoFormation.deleteMany({
        where: { formationId: params.id }
      }),
      
      // Supprimer les vidéos elles-mêmes
      prisma.video.deleteMany({
        where: { id: { in: videoIds } }
      }),

      // Supprimer les achats
      prisma.purchase.deleteMany({
        where: {
          itemId: params.id,
          type: 'formation'
        }
      }),

      // Supprimer l'historique
      prisma.history.deleteMany({
        where: {
          itemId: params.id,
          type: 'formation'
        }
      }),

      // Supprimer les commentaires
      prisma.comment.deleteMany({
        where: {
          itemId: params.id,
          itemType: 'formation'
        }
      }),

      // Supprimer les notifications
      prisma.notification.deleteMany({
        where: {
          contentId: params.id,
          contentType: 'formation'
        }
      }),

      // Enfin, supprimer la formation
      prisma.formation.delete({
        where: { id: params.id }
      })
    ])

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
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role as string)) {
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