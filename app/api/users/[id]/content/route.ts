import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const [articles, videos, formations] = await Promise.all([
      prisma.article.findMany({
        where: { authorId: params.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.video.findMany({
        where: { authorId: params.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.formation.findMany({
        where: { authorId: params.id },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({
      articles,
      videos,
      formations
    })
  } catch (error) {
    console.error('Erreur récupération contenu:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contenu' },
      { status: 500 }
    )
  }
} 