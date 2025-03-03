import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = await req.json()

    // Créer un slug unique avec un timestamp
    const uniqueSlug = `${slugify(data.title)}-${Date.now()}`

    // Créer l'article
    const article = await prisma.article.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId,
        isPremium: data.isPremium,
        price: data.price,
        slug: uniqueSlug,
        authorId: session.user.id,
        categoryId: data.categoryId
      }
    })

    // Créer une notification pour l'auteur
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'NEW_ARTICLE',
        title: 'Nouvel article créé',
        message: `Votre article "${data.title}" a été publié avec succès.`,
        contentId: article.id,
        contentType: 'article'
      }
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Erreur création article:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      items: articles,
      total: articles.length
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    )
  }
} 