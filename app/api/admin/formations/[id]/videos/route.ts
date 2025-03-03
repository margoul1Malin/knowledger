import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { videos } = body

    if (!Array.isArray(videos)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      )
    }

    // Attendre l'ID et le convertir en string
    const formationId = params.id

    // Récupérer la formation pour son image de couverture
    const formation = await prisma.formation.findUnique({
      where: { id: formationId }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Supprimer les anciennes VideoFormation s'il y en a
    await prisma.videoFormation.deleteMany({
      where: { formationId: formation.id }
    })

    try {
      // D'abord créer les vidéos
      const videoPromises = videos.map(async (video) => {
        return prisma.video.create({
          data: {
            title: video.title,
            description: video.description,
            videoUrl: video.videoUrl,
            videoPublicId: video.videoPublicId,
            coverImage: formation.imageUrl,
            coverImagePublicId: formation.imagePublicId,
            authorId: session.user.id,
            categoryId: formation.categoryId,
            slug: `${video.title}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }
        })
      })

      const createdVideos = await Promise.all(videoPromises)

      // Ensuite créer les VideoFormation
      const videoFormations = await Promise.all(
        createdVideos.map((video, index) => {
          return prisma.videoFormation.create({
            data: {
              formationId: formation.id,
              videoId: video.id,
              order: index,
              coverImage: formation.imageUrl
            }
          })
        })
      )

      return NextResponse.json({
        success: true,
        videoFormations
      })

    } catch (error) {
      console.error('Erreur Prisma:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création des VideoFormation' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur générale:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout des vidéos' },
      { status: 500 }
    )
  }
} 