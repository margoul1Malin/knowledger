import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import slugify from 'slugify'

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