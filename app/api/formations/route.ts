import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import slugify from '@/lib/slugify'
import { Prisma } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = await req.json()

    // Créer la formation
    const formation = await prisma.formation.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        imageUrl: data.imageUrl,
        isPremium: data.isPremium,
        price: data.price,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        authorId: session.user.id,
        categoryId: data.categoryId
      }
    })

    // Créer une notification pour l'auteur
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'NEW_FORMATION',
        title: 'Nouvelle formation créée',
        message: `Votre formation "${data.title}" a été publiée avec succès.`,
        contentId: formation.id,
        contentType: 'formation'
      }
    })

    return NextResponse.json(formation)
  } catch (error) {
    console.error('Erreur création formation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '15')
    const skip = (page - 1) * limit

    const [formations, total] = await Promise.all([
      prisma.formation.findMany({
        skip,
        take: limit,
        include: {
          author: {
            select: {
              name: true,
              image: true
            }
          },
          ratings: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.formation.count()
    ])

    // Calculer la moyenne des notes pour chaque formation
    const formationsWithRatings = formations.map(formation => {
      const ratings = formation.ratings || []
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0

      const { ratings: _, ...formationWithoutRatings } = formation
      return {
        ...formationWithoutRatings,
        averageRating,
        totalRatings: ratings.length
      }
    })

    return NextResponse.json({
      items: formationsWithRatings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })
  } catch (error) {
    console.error("[FORMATIONS_GET]", error)
    return new NextResponse("Erreur interne", { status: 500 })
  }
} 