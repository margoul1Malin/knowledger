import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const [articles, videos, formations] = await Promise.all([
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
          imageUrl: true
        }
      }),
      prisma.video.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          formations: {
            none: {}
          }
        },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          coverImage: true
        }
      }),
      prisma.formation.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          imageUrl: true
        }
      })
    ])

    const results = [
      ...articles.map(a => ({ ...a, type: 'article' })),
      ...videos.map(v => ({ ...v, type: 'video' })),
      ...formations.map(f => ({ ...f, type: 'formation' }))
    ]

    return NextResponse.json(results)
  } catch (error) {
    console.error('Erreur recherche:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
