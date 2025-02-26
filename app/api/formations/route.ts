import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import slugify from '@/lib/slugify'
import { Prisma } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, content, imageUrl, categoryId, isPremium, price, authorId } = body

    try {
      const formation = await prisma.formation.create({
        data: {
          title: String(title),
          description: String(description),
          content: String(content),
          imageUrl: String(imageUrl),
          slug: slugify(String(title)),
          categoryId: String(categoryId),
          isPremium: Boolean(isPremium),
          price: isPremium ? Number(price) || 0 : null,
          authorId: String(authorId)
        }
      })

      return NextResponse.json(formation)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { error: `Erreur base de données: ${error.message}` },
          { status: 500 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Erreur création formation:', error)
    return NextResponse.json(
      { 
        error: `Erreur lors de la création de la formation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 15
  const skip = (page - 1) * limit

  try {
    const [formations, total] = await Promise.all([
      prisma.formation.findMany({
        include: {
          author: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip
      }),
      prisma.formation.count()
    ])

    return NextResponse.json({
      items: formations,
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
      { error: 'Erreur lors de la récupération des formations' },
      { status: 500 }
    )
  }
} 