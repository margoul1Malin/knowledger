import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET() {
  try {
    console.log('1. Début de la requête GET content')
    
    const session = await getServerSession(authOptions)
    console.log('2. Session reçue:', session?.user)

    if (!session?.user?.id) {
      console.log('3. Pas de session utilisateur valide')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userRole = session.user.role as UserRole
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.FORMATOR) {
      console.log('4. Rôle utilisateur non autorisé:', session.user.role)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('5. UserId:', userId)

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
    console.log('6. Articles récupérés:', articles.length)

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
    console.log('7. Vidéos récupérées:', videos.length)

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
    console.log('8. Formations récupérées:', formations.length)

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

    console.log('9. Données formatées avec succès')

    return NextResponse.json({
      articles: formattedArticles,
      videos: formattedVideos,
      formations: formattedFormations
    })
  } catch (error) {
    console.error('Erreur complète content:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la récupération du contenu' },
      { status: 500 }
    )
  }
} 