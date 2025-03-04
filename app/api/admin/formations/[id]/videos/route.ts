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
    
    if (!session?.user?.role || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
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

    // Récupérer la formation pour son image de couverture
    const formation = await prisma.formation.findUnique({
      where: { id: params.id }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Supprimer les anciennes VideoFormation s'il y en a
    await prisma.videoFormation.deleteMany({
      where: { formationId: formation.id }
    })

    try {
      let createdVideos = [];

      // D'abord créer les vidéos
      for (const video of videos) {
        try {
          const createdVideo = await prisma.video.create({
            data: {
              title: video.title,
              description: video.description,
              videoUrl: video.videoUrl,
              videoPublicId: video.videoPublicId,
              coverImage: formation.imageUrl,
              coverImagePublicId: formation.imagePublicId,
              authorId: session.user.id,
              categoryId: formation.categoryId,
              slug: `${video.title}-${Date.now()}-${Math.random().toString(36).substring(7)}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }
          });
          createdVideos.push(createdVideo);
        } catch (error) {
          console.error('Erreur lors de la création de la vidéo:', error);
          // En cas d'erreur, supprimer les vidéos déjà créées
          if (createdVideos.length > 0) {
            await prisma.video.deleteMany({
              where: {
                id: {
                  in: createdVideos.map(v => v.id)
                }
              }
            });
          }
          throw error;
        }
      }

      // Ensuite créer les VideoFormation avec orderId
      const videoFormations = await Promise.all(
        createdVideos.map((video, index) => {
          return prisma.videoFormation.create({
            data: {
              formationId: formation.id,
              videoId: video.id,
              order: index,
              orderId: index + 1,
              coverImage: formation.imageUrl,
              videoPublicId: video.videoPublicId
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