import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
      { error: 'Erreur lors de la vérification de l\'accès' },
      { status: 500 }
    )
  }
} 