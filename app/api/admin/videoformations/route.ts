import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const videoFormations = await prisma.videoFormation.findMany({
      include: {
        video: {
          select: {
            title: true,
            videoUrl: true,
            coverImage: true,
            slug: true
          }
        },
        formation: {
          select: {
            title: true,
            slug: true
          }
        }
      },
      orderBy: [
        { formationId: 'asc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json(videoFormations)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des vidéos de formation' },
      { status: 500 }
    )
  }
}
