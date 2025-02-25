import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      type: purchase.type,
      price: purchase.price,
      createdAt: purchase.createdAt,
      item: {
        title: purchase[purchase.type]?.title,
        slug: purchase[purchase.type]?.slug,
        imageUrl: purchase[purchase.type]?.imageUrl || purchase[purchase.type]?.coverImage
      }
    }))

    return NextResponse.json(formattedPurchases)
  } catch (error) {
    console.error('Erreur récupération achats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des achats' },
      { status: 500 }
    )
  }
} 