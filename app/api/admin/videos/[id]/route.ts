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
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la vidéo pour avoir les publicId
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: {
        videoPublicId: true,
        coverImagePublicId: true
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Vidéo non trouvée' }, { status: 404 })
    }

    // Supprimer les ressources de Cloudinary
    try {
      if (video.videoPublicId) {
        console.log('Suppression de la vidéo Cloudinary:', video.videoPublicId)
        await cloudinary.uploader.destroy(video.videoPublicId, {
          resource_type: 'video'
        })
      }
      if (video.coverImagePublicId) {
        console.log('Suppression de l\'image de couverture Cloudinary:', video.coverImagePublicId)
        await cloudinary.uploader.destroy(video.coverImagePublicId, {
          resource_type: 'image'
        })
      }
    } catch (cloudinaryError) {
      console.error('Erreur lors de la suppression Cloudinary:', cloudinaryError)
      // On continue même si la suppression Cloudinary échoue
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