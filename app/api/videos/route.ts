import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import slugify from 'slugify'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '15')
    const formationId = searchParams.get('formationId')
    const skip = (page - 1) * limit

    const where = formationId ? {
      formations: {
        some: {
          formationId
        }
      }
    } : {
      formations: {
        none: {}
      }
    }

    // Récupérer le nombre total de vidéos
    const total = await prisma.video.count({ where })

    // Récupérer les vidéos avec pagination
    const videos = await prisma.video.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        coverImage: true,
        duration: true,
        isPremium: true,
        price: true,
        slug: true,
        formations: formationId ? {
          where: {
            formationId
          },
          select: {
            order: true,
            coverImage: true
          }
        } : undefined,
        author: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    return NextResponse.json({
      items: videos,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({
      items: [],
      pagination: {
        total: 0,
        pages: 0,
        page: 1,
        limit: 15
      }
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = await request.json()

    // Créer la vidéo
    const video = await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        coverImage: data.coverImage || data.videoUrl.replace(/\.[^/.]+$/, '.jpg'),
        isPremium: false,
        price: null,
        slug: slugify(data.title, { lower: true }),
        author: {
          connect: {
            id: session.user.id
          }
        },
        category: {
          connect: {
            id: "67c2407acbf64d7a1b89aa91" // ID de la catégorie par défaut
          }
        }
      }
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Erreur création vidéo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
} 