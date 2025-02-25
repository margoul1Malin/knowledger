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
    const video = await prisma.video.findUnique({
      where: { slug: params.slug },
      include: { 
        author: true,
        purchases: {
          where: {
            userId: session?.user?.id || '',
            type: 'video'
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json({ error: 'Vidéo non trouvée' }, { status: 404 })
    }

    const hasPurchased = video.purchases.length > 0
    const canAccess = hasPurchased || 
                     !video.isPremium || 
                     ['PREMIUM', 'ADMIN', 'FORMATOR'].includes(session?.user?.role || '')

    return NextResponse.json({
      ...video,
      hasPurchased,
      canAccess
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la vidéo' },
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

    const video = await prisma.video.findUnique({
      where: { slug: params.slug }
    })

    if (!video) {
      return new NextResponse(
        JSON.stringify({ error: 'Vidéo non trouvée' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Supprimer d'abord les relations VideoFormation
    await prisma.videoFormation.deleteMany({
      where: { videoId: video.id }
    })

    // Supprimer les achats liés
    await prisma.purchase.deleteMany({
      where: { 
        contentId: video.id,
        type: 'video'
      }
    })

    // Supprimer la vidéo
    await prisma.video.delete({
      where: { id: video.id }
    })

    return new NextResponse(
      JSON.stringify({ 
        message: 'Vidéo supprimée avec succès',
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