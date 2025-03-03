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
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
      })
    }

    const formationId = params.id
    const { videos } = await req.json()

    // Vérifier que l'utilisateur est l'auteur de la formation ou admin
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
      select: { authorId: true }
    })

    if (!formation) {
      return new Response(JSON.stringify({ error: "Formation non trouvée" }), {
        status: 404,
      })
    }

    if (formation.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 403,
      })
    }

    // Supprimer toutes les relations existantes
    await prisma.videoFormation.deleteMany({
      where: { formationId }
    })

    // Créer les nouvelles relations avec l'ordre
    const videoFormations = await Promise.all(
      videos.map((video: any, index: number) => 
        prisma.videoFormation.create({
          data: {
            formationId,
            videoId: video.id,
            order: index
          }
        })
      )
    )

    return new Response(JSON.stringify(videoFormations))
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