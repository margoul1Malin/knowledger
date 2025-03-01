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
    const formation = await prisma.formation.findUnique({
      where: { slug: params.slug },
      include: { 
        author: true,
        videos: {
          include: {
            video: true
          }
        },
        purchases: {
          where: {
            userId: session?.user?.id || '',
            type: 'formation'
          }
        }
      }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    const hasPurchased = formation.purchases.length > 0
    const canAccess = hasPurchased || 
                     !formation.isPremium || 
                     ['PREMIUM', 'ADMIN', 'FORMATOR'].includes(session?.user?.role || '')

    return NextResponse.json({
      ...formation,
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