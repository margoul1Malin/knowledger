import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import slugify from '@/lib/slugify'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 15
  const skip = (page - 1) * limit

  try {
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: {
          formations: { none: {} }
        },
        include: {
          author: true,
          category: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip
      }),
      prisma.video.count({
        where: {
          formations: { none: {} }
        }
      })
    ])

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
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des vidéos' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, videoUrl, coverImage, categoryId, isPremium, price, authorId } = body

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        coverImage,
        slug: slugify(title),
        categoryId,
        isPremium,
        price: isPremium ? price : null,
        authorId
      }
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Erreur création vidéo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la vidéo' },
      { status: 500 }
    )
  }
} 