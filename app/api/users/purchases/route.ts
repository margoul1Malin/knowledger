import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            slug: true
          }
        },
        video: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            slug: true
          }
        },
        formation: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Erreur lors de la récupération des achats:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 