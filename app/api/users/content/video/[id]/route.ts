import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import slugify from 'slugify'
import { cloudinary } from '@/lib/cloudinary-config'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la vidéo avec ses publicId
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: {
        authorId: true,
        videoPublicId: true,
        coverImagePublicId: true
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Vidéo non trouvée' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est l'auteur ou admin
    if (session.user.id !== video.authorId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
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
      return NextResponse.json(
        { error: 'Erreur lors de la suppression des fichiers' },
        { status: 500 }
      )
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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = await req.json()

    // Vérifier que l'utilisateur est l'auteur de la vidéo ou admin
    const video = await prisma.video.findUnique({
      where: { id: params.id }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Vidéo non trouvée' },
        { status: 404 }
      )
    }

    if (video.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Générer un nouveau slug si le titre a changé
    const slug = data.title !== video.title
      ? slugify(data.title, { lower: true })
      : video.slug

    // Mettre à jour la vidéo
    const updatedVideo = await prisma.video.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        coverImage: data.coverImage,
        isPremium: data.isPremium,
        price: data.isPremium ? data.price : null,
        categoryId: data.categoryId,
        slug,
        duration: data.duration || null
      }
    })

    return NextResponse.json(updatedVideo)
  } catch (error) {
    console.error('Erreur lors de la modification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
} 