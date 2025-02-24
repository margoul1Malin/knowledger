import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Supprimer d'abord les relations avec les vidéos
    await prisma.videoFormation.deleteMany({
      where: { formationId: params.id }
    })

    // Puis supprimer la formation
    await prisma.formation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Formation supprimée' })
  } catch (error) {
    console.error('Erreur suppression formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
} 