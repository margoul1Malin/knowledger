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
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
      })
    }

    if (!params.id) {
      return new Response(JSON.stringify({ error: "ID de formation manquant" }), {
        status: 400,
      })
    }

    const formationId = params.id
    const { videos } = await req.json()

    // Vérifier que l'utilisateur est l'auteur de la formation ou admin
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
      include: {
        parcours: true,
        videos: {
          include: {
            video: {
              include: {
                formations: true
              }
            }
          }
        }
      }
    })

    if (!formation) {
      return new Response(JSON.stringify({ error: "Formation non trouvée" }), {
        status: 404,
      })
    }

    const userRole = session.user.role as string | undefined
    if (formation.authorId !== session.user.id && userRole !== 'ADMIN') {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 403,
      })
    }

    // Commencer une transaction pour garantir l'intégrité des données
    const result = await prisma.$transaction(async (tx) => {
      // 1. Récupérer les IDs des vidéos actuelles et nouvelles
      const currentVideoIds = formation.videos.map(v => v.videoId)
      const newVideoIds = videos.map((v: any) => v.id)

      // 2. Identifier les vidéos à supprimer (celles qui ne sont plus dans la liste)
      const videosToRemove = currentVideoIds.filter(id => !newVideoIds.includes(id))

      // 3. Supprimer uniquement les relations pour les vidéos qui ne sont plus dans la formation
      if (videosToRemove.length > 0) {
        await tx.videoFormation.deleteMany({
          where: {
            formationId,
            videoId: {
              in: videosToRemove
            }
          }
        })
      }

      // 4. Créer ou mettre à jour les relations avec l'ordre spécifié et l'orderId
      const videoFormations = []
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        const videoFormation = await tx.videoFormation.upsert({
          where: {
            formationId_videoId: {
              formationId,
              videoId: video.id
            }
          },
          create: {
            formationId,
            videoId: video.id,
            order: i,
            orderId: i + 1
          },
          update: {
            order: i,
            orderId: i + 1
          }
        })
        videoFormations.push(videoFormation)
      }

      // 5. Mettre à jour la formation avec la nouvelle durée totale
      const totalDuration = formation.videos.reduce((sum, v) => sum + (v.video.duration || 0), 0)
      await tx.formation.update({
        where: { id: formationId },
        data: { duration: totalDuration }
      })

      return videoFormations
    })

    // Récupérer la formation mise à jour avec les vidéos triées par orderId
    const updatedFormation = await prisma.formation.findUnique({
      where: { id: formationId },
      include: {
        parcours: true,
        videos: {
          include: {
            video: {
              include: {
                formations: true
              }
            }
          },
          orderBy: {
            orderId: 'asc'
          }
        }
      }
    })

    return new Response(JSON.stringify({
      success: true,
      formation: updatedFormation
    }))
  } catch (error) {
    console.error('[FORMATION_VIDEOS]', error)
    return new Response(JSON.stringify({ error: "Erreur lors de la mise à jour des vidéos" }), {
      status: 500,
    })
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
