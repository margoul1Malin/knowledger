import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params: paramsPromise }: { params: { slug: string } }
) {
  const params = await paramsPromise
  try {
    const session = await getServerSession(authOptions)
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: { 
        author: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }

    // Vérifier l'achat séparément
    const purchase = await prisma.purchase.findFirst({
      where: {
        AND: [
          { userId: session?.user?.id || '' },
          { itemId: article.id },
          { type: 'article' }
        ]
      }
    })

    const hasPurchased = !!purchase
    const canAccess = hasPurchased || 
                     !article.isPremium || 
                     ['PREMIUM', 'ADMIN', 'FORMATOR'].includes(session?.user?.role || '')

    return NextResponse.json({
      ...article,
      hasPurchased,
      canAccess
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return new NextResponse(
        JSON.stringify({ error: 'Non autorisé' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const article = await prisma.article.findUnique({
      where: { slug: params.slug }
    })

    if (!article) {
      return new NextResponse(
        JSON.stringify({ error: 'Article non trouvé' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Supprimer les achats liés
    await prisma.purchase.deleteMany({
      where: { 
        contentId: article.id,
        type: 'article'
      }
    })

    // Supprimer l'article
    await prisma.article.delete({
      where: { id: article.id }
    })

    return new NextResponse(
      JSON.stringify({ 
        message: 'Article supprimé avec succès',
        success: true 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Erreur lors de la suppression',
        success: false
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 