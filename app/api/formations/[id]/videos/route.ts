import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import slugify from '@/lib/slugify'

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

    const formation = await prisma.formation.findUnique({
      where: { id: params.id }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    const videoFormations = []

    for (const videoData of videos) {
      const videoFormation = await prisma.videoFormation.create({
        data: {
          order: videoData.order,
          coverImage: formation.imageUrl,
          formation: {
            connect: { id: formation.id }
          },
          video: {
            create: {
              title: String(videoData.title),
              description: String(videoData.description),
              videoUrl: String(videoData.videoUrl),
              coverImage: formation.imageUrl,
              slug: slugify(String(videoData.title)),
              author: {
                connect: { id: formation.authorId }
              },
              category: {
                connect: { id: formation.categoryId }
              },
              isPremium: formation.isPremium,
              price: null
            }
          }
        },
        include: {
          video: true
        }
      })

      videoFormations.push(videoFormation)
    }

    return NextResponse.json({ success: true, videoFormations })
  } catch (error) {
    console.error('Erreur ajout vidéos:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout des vidéos' },
      { status: 500 }
    )
  }
} 