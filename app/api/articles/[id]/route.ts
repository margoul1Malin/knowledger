import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import slugify from '@/lib/slugify'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { title, content, imageUrl, categoryId, isPremium, price } = await req.json()
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title,
        content,
        imageUrl,
        slug: slugify(title),
        categoryId,
        isPremium,
        price: isPremium ? price : null
      }
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Erreur modification article:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    await prisma.article.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Article supprimé' })
  } catch (error) {
    console.error('Erreur suppression article:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
} 