import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (session.user.role === 'NORMAL') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const history = await prisma.history.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            slug: true
          }
        },
        formation: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé - ID utilisateur manquant' 
      }, { status: 401 })
    }

    // Récupérer l'ID de l'élément à supprimer depuis l'URL
    const { searchParams } = new URL(request.url)
    const historyId = searchParams.get('id')

    // Si pas d'ID, supprimer tout l'historique
    if (!historyId) {
      await prisma.history.deleteMany({
        where: {
          userId: session.user.id
        }
      })
      return NextResponse.json({ 
        success: true, 
        message: 'Historique entièrement supprimé' 
      })
    }

    // Sinon, supprimer l'élément spécifique
    const history = await prisma.history.findUnique({
      where: { id: historyId }
    })

    if (!history) {
      return NextResponse.json({ 
        success: false, 
        error: 'Élément non trouvé' 
      }, { status: 404 })
    }

    // Vérifier que l'utilisateur est propriétaire de cet historique
    if (history.userId !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé' 
      }, { status: 401 })
    }

    await prisma.history.delete({
      where: { id: historyId }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Élément supprimé' 
    })
  } catch (error) {
    console.error('Erreur DELETE history:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (session.user.role === 'NORMAL') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { type, itemId, timestamp } = body

    if (!type || !itemId || timestamp === undefined) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Vérifier si un historique existe déjà
    const existingHistory = await prisma.history.findFirst({
      where: {
        userId: session.user.id,
        itemId: itemId,
        type: type
      }
    })

    let history
    if (existingHistory) {
      // Mettre à jour l'historique existant
      history = await prisma.history.update({
        where: { id: existingHistory.id },
        data: {
          timestamp: timestamp,
          lastViewedAt: new Date()
        }
      })
    } else {
      // Créer un nouvel historique
      history = await prisma.history.create({
        data: {
          userId: session.user.id,
          itemId: itemId,
          type: type,
          timestamp: timestamp,
          lastViewedAt: new Date()
        }
      })
    }

    return NextResponse.json({ success: true, data: history })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
