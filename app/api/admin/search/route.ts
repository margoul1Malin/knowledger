import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupération du paramètre de recherche
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Paramètre de recherche manquant' }, { status: 400 })
    }

    // Recherche dans toutes les tables
    const [articles, videos, formations, users, categories, videoFormations] = await Promise.all([
      // Recherche dans les articles
      prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          slug: true,
        },
      }),

      // Recherche dans les vidéos
      prisma.video.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          slug: true,
        },
      }),

      // Recherche dans les formations
      prisma.formation.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          slug: true,
        },
      }),

      // Recherche dans les utilisateurs
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),

      // Recherche dans les catégories
      prisma.category.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),

      // Recherche dans les vidéos de formation
      prisma.videoFormation.findMany({
        where: {
          video: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
        select: {
          id: true,
          createdAt: true,
          video: {
            select: {
              title: true,
            },
          },
          formation: {
            select: {
              title: true,
            },
          },
        },
      }),
    ])

    // Formatage des résultats
    const formattedResults = [
      ...articles.map(article => ({
        ...article,
        type: 'article' as const,
        url: `/admin/articles/${article.slug}/edit`,
      })),
      ...videos.map(video => ({
        ...video,
        type: 'video' as const,
        url: `/admin/videos/${video.slug}/edit`,
      })),
      ...formations.map(formation => ({
        ...formation,
        type: 'formation' as const,
        url: `/admin/formations/${formation.slug}/edit`,
      })),
      ...users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        type: 'user' as const,
        url: `/admin/users`,
      })),
      ...categories.map(category => ({
        id: category.id,
        title: category.name,
        createdAt: category.createdAt,
        type: 'category' as const,
      })),
      ...videoFormations.map(vf => ({
        id: vf.id,
        title: `${vf.video.title} (${vf.formation.title})`,
        createdAt: vf.createdAt,
        type: 'videoFormation' as const,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Erreur de recherche:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
} 