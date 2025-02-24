import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import slugify from '@/lib/slugify'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { title, content, imageUrl, categoryId, isPremium, price, authorId } = body

    const article = await prisma.article.create({
      data: {
        title,
        content,
        imageUrl,
        slug: slugify(title),
        categoryId,
        isPremium,
        price: isPremium ? price : null,
        authorId
      }
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Erreur création article:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        author: true,
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(articles)
  } catch (error) {
    console.error('Erreur récupération articles:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    )
  }
} 