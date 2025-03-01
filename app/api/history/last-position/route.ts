import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const type = searchParams.get('type')

    if (!itemId || !type) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const history = await prisma.history.findFirst({
      where: {
        userId: session.user.id,
        itemId: itemId,
        type: type
      },
      orderBy: {
        lastViewedAt: 'desc'
      },
      select: {
        timestamp: true
      }
    })

    return NextResponse.json({ 
      timestamp: history?.timestamp || 0
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 