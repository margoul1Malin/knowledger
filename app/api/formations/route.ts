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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '15')
    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const [total, items] = await Promise.all([
      prisma.formation.count(),
      prisma.formation.findMany({
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          purchases: userId ? {
            where: {
              userId: userId
            }
          } : false
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    // Ajouter hasPurchased à chaque formation
    const formationsWithPurchaseInfo = items.map(formation => ({
      ...formation,
      hasPurchased: formation.purchases && formation.purchases.length > 0,
      purchases: undefined // Supprimer les données de purchase pour alléger la réponse
    }))

    return NextResponse.json({
      items: formationsWithPurchaseInfo,
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
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 