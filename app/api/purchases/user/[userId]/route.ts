import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.id !== params.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const purchases = await prisma.purchase.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          select: {
            title: true,
            slug: true,
            imageUrl: true
          }
        },
        video: {
          select: {
            title: true,
            slug: true,
            coverImage: true
          }
        },
        formation: {
          select: {
            title: true,
            slug: true,
            imageUrl: true
          }
        }
      }
    })

    // Transformer les données pour avoir un format uniforme
    const formattedPurchases = purchases.map(purchase => {
      let item
      if (purchase.article) {
        item = {
          title: purchase.article.title,
          slug: purchase.article.slug,
          imageUrl: purchase.article.imageUrl
        }
      } else if (purchase.video) {
        item = {
          title: purchase.video.title,
          slug: purchase.video.slug,
          imageUrl: purchase.video.coverImage
        }
      } else if (purchase.formation) {
        item = {
          title: purchase.formation.title,
          slug: purchase.formation.slug,
          imageUrl: purchase.formation.imageUrl
        }
      }

      return {
        id: purchase.id,
        type: purchase.type.toLowerCase(),
        price: purchase.price,
        createdAt: purchase.createdAt,
        item
      }
    })

    return NextResponse.json(formattedPurchases)
  } catch (error) {
    console.error('Erreur lors de la récupération des achats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des achats' },
      { status: 500 }
    )
  }
} 