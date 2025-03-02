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
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le commentaire
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Commentaire non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est l'auteur du commentaire
    if (comment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Supprimer le commentaire
    await prisma.comment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du commentaire' },
      { status: 500 }
    )
  }
} 