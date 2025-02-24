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

    // Vérifier si la vidéo existe
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: {
        formations: true
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Vidéo non trouvée' }, { status: 404 })
    }

    // Si la vidéo est liée à des formations, supprimer d'abord les relations
    if (video.formations.length > 0) {
      await prisma.videoFormation.deleteMany({
        where: { videoId: params.id }
      })
    }

    // Supprimer la vidéo
    await prisma.video.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Vidéo supprimée avec succès' })
  } catch (error) {
    console.error('Erreur suppression vidéo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la vidéo' },
      { status: 500 }
    )
  }
} 