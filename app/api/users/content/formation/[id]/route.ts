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

    // Vérifier que l'utilisateur est l'auteur de la formation ou admin
    const formation = await prisma.formation.findUnique({
      where: { id: params.id }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    if (formation.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Générer un nouveau slug si le titre a changé
    const slug = data.title !== formation.title
      ? slugify(data.title, { lower: true })
      : formation.slug

    // Mettre à jour la formation
    const updatedFormation = await prisma.formation.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        imageUrl: data.imageUrl,
        isPremium: data.isPremium,
        price: data.isPremium ? data.price : null,
        categoryId: data.categoryId,
        slug
      }
    })

    return NextResponse.json(updatedFormation)
  } catch (error) {
    console.error('Erreur lors de la modification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}

// Route pour gérer les vidéos de la formation
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { videos } = await req.json()

    // Vérifier que l'utilisateur est l'auteur de la formation ou admin
    const formation = await prisma.formation.findUnique({
      where: { id: params.id },
      include: {
        videos: true
      }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    if (formation.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer les vidéos existantes
    const existingVideos = formation.videos.map(v => ({
      videoId: v.videoId,
      order: v.order,
      coverImage: v.coverImage
    }))

    // Identifier les vidéos à supprimer (celles qui ne sont plus dans la liste)
    const videosToKeep = videos.map((v: any) => v.id)
    await prisma.videoFormation.deleteMany({
      where: {
        formationId: params.id,
        videoId: {
          notIn: videosToKeep
        }
      }
    })

    // Mettre à jour l'ordre des vidéos existantes et ajouter les nouvelles
    for (const video of videos) {
      await prisma.videoFormation.upsert({
        where: {
          formationId_videoId: {
            formationId: params.id,
            videoId: video.id
          }
        },
        create: {
          formationId: params.id,
          videoId: video.id,
          order: video.order,
          coverImage: formation.imageUrl
        },
        update: {
          order: video.order
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la modification des vidéos:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification des vidéos' },
      { status: 500 }
    )
  }
} 