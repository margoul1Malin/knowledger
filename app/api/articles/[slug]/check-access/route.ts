import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: { author: true }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }

    let hasPurchased = false

    if (session?.user) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          AND: [
            { userId: session.user.id },
            { itemId: article.id },
            { type: 'article' }
          ]
        }
      })

      hasPurchased = !!purchase
    }

    return NextResponse.json({
      article,
      hasPurchased
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'accès" },
      { status: 500 }
    )
  }
} 