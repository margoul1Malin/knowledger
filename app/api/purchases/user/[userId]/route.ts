import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { Purchase } from '@prisma/client'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.id !== params.userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: params.userId
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

    const formattedPurchases = purchases.map((purchase: any) => ({
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