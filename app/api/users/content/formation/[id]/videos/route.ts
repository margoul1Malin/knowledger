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
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formationId = params.id
    const { videos } = await req.json()

    // Vérifier que l'utilisateur est l'auteur de la formation ou admin
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
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

    // Créer ou mettre à jour les relations vidéo-formation
    const videoFormations = await Promise.all(
      videos.map(async (video: any, index: number) => {
        // Mettre à jour l'image de couverture de la vidéo si nécessaire
        if (video.id) {
          await prisma.video.update({
            where: { id: video.id },
            data: {
              coverImage: formation.imageUrl || video.coverImage
            }
          })

          // Vérifier si la relation existe déjà
          const existingRelation = await prisma.videoFormation.findFirst({
            where: {
              formationId,
              videoId: video.id
            }
          })

          if (existingRelation) {
            // Mettre à jour l'ordre si la relation existe
            return prisma.videoFormation.update({
              where: {
                formationId_videoId: {
                  formationId,
                  videoId: video.id
                }
              },
              data: {
                order: index
              }
            })
          }
        }

        // Créer une nouvelle relation si elle n'existe pas
        return prisma.videoFormation.create({
          data: {
            formationId,
            videoId: video.id,
            order: index
          }
        })
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la modification des vidéos:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification des vidéos' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formationId = params.id

    // Vérifier que l'utilisateur est l'auteur de la formation ou admin
    const formation = await prisma.formation.findUnique({
      where: { id: formationId }
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

    // Supprimer toutes les relations VideoFormation pour cette formation
    await prisma.videoFormation.deleteMany({
      where: { formationId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression des vidéos:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des vidéos' },
      { status: 500 }
    )
  }
} 