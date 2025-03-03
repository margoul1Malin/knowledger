import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer les 5 derniers articles
    const articles = await prisma.article.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        slug: true,
        createdAt: true
      }
    })

    // Récupérer les 5 dernières vidéos uniques (non liées à une formation)
    const videos = await prisma.video.findMany({
      where: {
        formations: {
          none: {}
        }
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        slug: true,
        createdAt: true
      }
    })

    // Récupérer les 5 dernières formations
    const formations = await prisma.formation.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        slug: true,
        createdAt: true
      }
    })

    // Formater les données pour avoir une structure uniforme
    const formattedContent = [
      ...articles.map(article => ({
        id: article.id,
        type: 'article' as const,
        title: article.title,
        description: article.content.slice(0, 150) + '...',
        imageUrl: article.imageUrl,
        slug: article.slug,
        createdAt: article.createdAt
      })),
      ...videos.map(video => ({
        id: video.id,
        type: 'video' as const,
        title: video.title,
        description: video.description,
        imageUrl: video.coverImage,
        slug: video.slug,
        createdAt: video.createdAt
      })),
      ...formations.map(formation => ({
        id: formation.id,
        type: 'formation' as const,
        title: formation.title,
        description: formation.description,
        imageUrl: formation.imageUrl,
        slug: formation.slug,
        createdAt: formation.createdAt
      }))
    ]

    // Trier par date de création et prendre les 15 plus récents
    const sortedContent = formattedContent.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    ).slice(0, 15)

    return NextResponse.json(sortedContent)
  } catch (error) {
    console.error('Erreur lors de la récupération des contenus récents:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des contenus' },
      { status: 500 }
    )
  }
} 