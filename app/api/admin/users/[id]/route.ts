import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    const { role } = await req.json()
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { message: 'Erreur serveur' },
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
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 })
    }

    // Supprimer les commentaires de l'utilisateur
    await prisma.comment.deleteMany({
      where: { userId: params.id }
    })

    // Supprimer les notes de l'utilisateur
    await prisma.rating.deleteMany({
      where: { userId: params.id }
    })

    // Supprimer les messages de l'utilisateur
    await prisma.message.deleteMany({
      where: { userId: params.id }
    })

    // Supprimer les notifications de l'utilisateur
    await prisma.notification.deleteMany({
      where: { userId: params.id }
    })

    // Supprimer l'historique de l'utilisateur
    await prisma.history.deleteMany({
      where: { userId: params.id }
    })

    // Supprimer les achats de l'utilisateur
    await prisma.purchase.deleteMany({
      where: { userId: params.id }
    })

    // Le profil public sera supprimé automatiquement grâce à onDelete: Cascade

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Utilisateur supprimé' })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 