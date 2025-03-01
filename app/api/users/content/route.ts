import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les articles
    const articles = await prisma.article.findMany({
      where: {
        authorId: session.user.id
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Récupérer les vidéos
    const videos = await prisma.video.findMany({
      where: {
        authorId: session.user.id,
        formations: {
          none: {}
        }
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Récupérer les formations
    const formations = await prisma.formation.findMany({
      where: {
        authorId: session.user.id
      },
      include: {
        category: true,
        videos: {
          include: {
            video: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      articles,
      videos,
      formations
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 