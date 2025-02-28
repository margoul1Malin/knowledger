import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('itemId')
    const itemType = searchParams.get('itemType')

    if (!itemId || !itemType) {
      return new NextResponse("Paramètres manquants", { status: 400 })
    }

    const comments = await prisma.comment.findMany({
      where: {
        itemId,
        itemType
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("[COMMENTS_GET]", error)
    return new NextResponse("Erreur interne", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Non autorisé", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("Utilisateur non trouvé", { status: 404 })
    }

    const body = await req.json()
    const { content, itemId, itemType } = body

    if (!content || !itemId || !itemType) {
      return new NextResponse("Données manquantes", { status: 400 })
    }

    // Vérifier que l'objet commenté existe
    let itemExists = false
    switch (itemType) {
      case 'article':
        itemExists = !!(await prisma.article.findUnique({ where: { id: itemId } }))
        break
      case 'video':
        itemExists = !!(await prisma.video.findUnique({ where: { id: itemId } }))
        break
      case 'formation':
        itemExists = !!(await prisma.formation.findUnique({ where: { id: itemId } }))
        break
    }

    if (!itemExists) {
      return new NextResponse("Objet non trouvé", { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        itemId,
        itemType,
        userId: user.id
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("[COMMENT_POST]", error)
    return new NextResponse("Erreur interne", { status: 500 })
  }
} 