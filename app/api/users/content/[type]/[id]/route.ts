import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary-config'
import type { Article, Video, Formation, UserRole } from '@prisma/client'

type ContentType = 'article' | 'video' | 'formation'

export async function DELETE(
  req: Request,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { type, id } = params
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    let content: any
    const resourcesToDelete: Array<{ publicId: string, resourceType: 'image' | 'video' }> = []

    // Récupérer le contenu selon son type
    switch (type as ContentType) {
      case 'article': {
        const article = await prisma.article.findUnique({
          where: { id },
          select: {
            authorId: true,
            imagePublicId: true
          }
        })
        if (!article) {
          return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
        }
        content = article
        if (article.imagePublicId) {
          resourcesToDelete.push({ publicId: article.imagePublicId, resourceType: 'image' })
        }
        break
      }
      case 'video': {
        const video = await prisma.video.findUnique({
          where: { id },
          select: {
            authorId: true,
            videoPublicId: true,
            coverImagePublicId: true
          }
        })
        if (!video) {
          return NextResponse.json({ error: 'Vidéo non trouvée' }, { status: 404 })
        }
        content = video
        if (video.videoPublicId) {
          resourcesToDelete.push({ publicId: video.videoPublicId, resourceType: 'video' })
        }
        if (video.coverImagePublicId) {
          resourcesToDelete.push({ publicId: video.coverImagePublicId, resourceType: 'image' })
        }
        break
      }
      case 'formation': {
        const formation = await prisma.formation.findUnique({
          where: { id },
          select: {
            authorId: true,
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
          return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
        }
        content = formation

        // Ajouter l'image de la formation
        if (formation.imagePublicId) {
          resourcesToDelete.push({ publicId: formation.imagePublicId, resourceType: 'image' })
        }

        // Ajouter les vidéos et leurs images de couverture
        formation.videos.forEach(videoFormation => {
          const video = videoFormation.video
          if (video.videoPublicId) {
            resourcesToDelete.push({ publicId: video.videoPublicId, resourceType: 'video' })
          }
          if (video.coverImagePublicId) {
            resourcesToDelete.push({ publicId: video.coverImagePublicId, resourceType: 'image' })
          }
        })
        break
      }
      default:
        return NextResponse.json(
          { error: 'Type de contenu invalide' },
          { status: 400 }
        )
    }

    // Vérifier que l'utilisateur est l'auteur ou un admin
    if (session.user.id !== content.authorId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Supprimer les ressources de Cloudinary
    try {
      console.log('Ressources à supprimer:', resourcesToDelete)
      for (const resource of resourcesToDelete) {
        if (!resource.publicId) continue
        
        console.log(`Suppression de la ressource Cloudinary (${resource.resourceType}):`, resource.publicId)
        await cloudinary.uploader.destroy(resource.publicId, {
          resource_type: resource.resourceType
        })
      }
    } catch (error) {
      console.error('Erreur lors de la suppression Cloudinary:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression des fichiers' },
        { status: 500 }
      )
    }

    // Supprimer les relations selon le type de contenu
    switch (type as ContentType) {
      case 'article': {
        await prisma.$transaction([
          // Supprimer les achats
          prisma.purchase.deleteMany({
            where: { itemId: id, type: 'article' }
          }),
          // Supprimer les commentaires
          prisma.comment.deleteMany({
            where: { itemId: id, itemType: 'article' }
          }),
          // Supprimer l'article
          prisma.article.delete({ where: { id } })
        ])
        break
      }

      case 'video': {
        await prisma.$transaction([
          // Supprimer les relations VideoFormation
          prisma.videoFormation.deleteMany({
            where: { videoId: id }
          }),
          // Supprimer les achats
          prisma.purchase.deleteMany({
            where: { itemId: id, type: 'video' }
          }),
          // Supprimer l'historique
          prisma.history.deleteMany({
            where: { itemId: id, type: 'video' }
          }),
          // Supprimer les commentaires
          prisma.comment.deleteMany({
            where: { itemId: id, itemType: 'video' }
          }),
          // Supprimer les notifications
          prisma.notification.deleteMany({
            where: { contentId: id, contentType: 'video' }
          }),
          // Supprimer la vidéo
          prisma.video.delete({ where: { id } })
        ])
        break
      }

      case 'formation': {
        const formation = await prisma.formation.findUnique({
          where: { id },
          select: {
            videos: {
              select: {
                video: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        })

        if (!formation) break

        const videoIds = formation.videos.map(v => v.video.id)

        await prisma.$transaction([
          // Supprimer les relations VideoFormation
          prisma.videoFormation.deleteMany({
            where: { formationId: id }
          }),
          // Supprimer les vidéos elles-mêmes
          prisma.video.deleteMany({
            where: { id: { in: videoIds } }
          }),
          // Supprimer les achats
          prisma.purchase.deleteMany({
            where: { itemId: id, type: 'formation' }
          }),
          // Supprimer l'historique
          prisma.history.deleteMany({
            where: { itemId: id, type: 'formation' }
          }),
          // Supprimer les commentaires
          prisma.comment.deleteMany({
            where: { itemId: id, itemType: 'formation' }
          }),
          // Supprimer les notifications
          prisma.notification.deleteMany({
            where: { contentId: id, contentType: 'formation' }
          }),
          // Supprimer la formation
          prisma.formation.delete({ where: { id } })
        ])
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role as UserRole)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { type, id } = params
    const data = await req.json()

    switch (type as ContentType) {
      case 'article':
        await prisma.article.update({
          where: { id },
          data
        })
        break
      case 'video':
        await prisma.video.update({
          where: { id },
          data
        })
        break
      case 'formation':
        await prisma.formation.update({
          where: { id },
          data
        })
        break
      default:
        return NextResponse.json(
          { error: 'Type de contenu invalide' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CONTENT_UPDATE]', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
} 