import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { name, slug } = await req.json()
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name, slug }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
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
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({ error: 'Non autorisé' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!category) {
      return new NextResponse(
        JSON.stringify({ error: 'Catégorie non trouvée' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Mettre à null les références dans les articles
    await prisma.article.updateMany({
      where: { categoryId: params.id },
      data: { categoryId: null }
    })

    // Mettre à null les références dans les vidéos
    await prisma.video.updateMany({
      where: { categoryId: params.id },
      data: { categoryId: null }
    })

    // Mettre à null les références dans les formations
    await prisma.formation.updateMany({
      where: { categoryId: params.id },
      data: { categoryId: null }
    })

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id: params.id }
    })

    return new NextResponse(
      JSON.stringify({ success: true }),
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