import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Créer une nouvelle catégorie "Non catégorisé" si elle n'existe pas
    let defaultCategory = await prisma.category.findFirst({
      where: { slug: 'non-categorise' }
    })

    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: {
          name: 'Non catégorisé',
          slug: 'non-categorise'
        }
      })
    }

    // Vérifier si la catégorie à supprimer existe
    const category = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    // Ne pas permettre la suppression de la catégorie par défaut
    if (category.slug === 'non-categorise') {
      return NextResponse.json(
        { error: 'Impossible de supprimer la catégorie par défaut' },
        { status: 400 }
      )
    }

    // Mettre à jour les références vers la catégorie par défaut
    await prisma.article.updateMany({
      where: { categoryId: params.id },
      data: { categoryId: defaultCategory.id }
    })

    await prisma.video.updateMany({
      where: { categoryId: params.id },
      data: { categoryId: defaultCategory.id }
    })

    await prisma.formation.updateMany({
      where: { categoryId: params.id },
      data: { categoryId: defaultCategory.id }
    })

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
} 