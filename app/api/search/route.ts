import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Requête de recherche manquante' }, { status: 400 })
    }

    const [articles, videos, formations, formators] = await Promise.all([
      // Recherche dans les articles
      prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          content: true,
          slug: true,
          imageUrl: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              image: true
            }
          }
        },
        take: 5
      }),

      // Recherche dans les vidéos (sans formation)
      prisma.video.findMany({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            },
            {
              formations: {
                none: {}
              }
            }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          coverImage: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              image: true
            }
          }
        },
        take: 5
      }),

      // Recherche dans les formations
      prisma.formation.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          imageUrl: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              image: true
            }
          }
        },
        take: 5
      }),

      // Recherche dans les profils publics des formateurs
      prisma.user.findMany({
        where: {
          AND: [
            { role: { in: ['FORMATOR', 'ADMIN'] } },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                {
                  publicProfile: {
                    OR: [
                      { bio: { contains: query, mode: 'insensitive' } },
                      { expertise: { has: query } }
                    ]
                  }
                }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          publicProfile: {
            select: {
              bio: true,
              expertise: true
            }
          }
        },
        take: 5
      })
    ])

    return NextResponse.json({
      articles,
      videos,
      formations,
      formators
    })
  } catch (error) {
    console.error('[SEARCH_GET]', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
