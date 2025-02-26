import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id

    // Récupérer les articles
    const articles = await prisma.article.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            purchases: true
          }
        }
      }
    })

    // Récupérer les vidéos
    const videos = await prisma.video.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            history: true,
            purchases: true
          }
        }
      }
    })

    // Récupérer les formations
    const formations = await prisma.formation.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            videos: true,
            history: true,
            purchases: true
          }
        }
      }
    })

    // Transformer les données pour inclure le nombre de vues et de vidéos
    const formattedVideos = videos.map(video => {
      const { _count, ...rest } = video
      return {
        ...rest,
        views: _count.history + _count.purchases
      }
    })

    const formattedFormations = formations.map(formation => {
      const { _count, ...rest } = formation
      return {
        ...rest,
        videos: _count.videos,
        views: _count.history + _count.purchases
      }
    })

    const formattedArticles = articles.map(article => {
      const { _count, ...rest } = article
      return {
        ...rest,
        views: _count.purchases
      }
    })

    return NextResponse.json({
      articles: formattedArticles,
      videos: formattedVideos,
      formations: formattedFormations
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contenu' },
      { status: 500 }
    )
  }
} 