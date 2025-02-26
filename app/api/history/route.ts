import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || !['ADMIN', 'PREMIUM', 'FORMATOR'].includes(session.user.role)) {
    return NextResponse.json({ 
      success: false, 
      error: 'Non autorisé' 
    }, { status: 401 })
  }

  try {
    const history = await prisma.history.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        lastViewedAt: 'desc'
      },
      include: {
        video: {
          select: {
            title: true,
            coverImage: true,
            slug: true
          }
        },
        formation: {
          select: {
            title: true,
            imageUrl: true,
            slug: true
          }
        }
      }
    })
    
    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error('Erreur GET history:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
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
    console.log('1. Début de la requête POST history')
    
    const session = await getServerSession(authOptions)
    console.log('2. Session reçue:', session)

    if (!session?.user?.id) {
      console.log('2. Pas de session utilisateur valide')
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé - ID utilisateur manquant' 
      }, { status: 401 })
    }

    if (!['ADMIN', 'PREMIUM', 'FORMATOR'].includes(session.user.role)) {
      console.log('2. Rôle utilisateur non autorisé:', session.user.role)
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé - Rôle insuffisant' 
      }, { status: 401 })
    }

    console.log('2. Session utilisateur OK:', session.user.id)

    const body = await request.json()
    console.log('3. Body reçu:', body)
    const { type, itemId, timestamp, duration } = body

    if (!type || !itemId || timestamp === undefined) {
      console.log('4. Données manquantes:', { type, itemId, timestamp })
      return NextResponse.json({ 
        success: false, 
        error: 'Données manquantes' 
      }, { status: 400 })
    }

    if (!['video', 'formation'].includes(type)) {
      console.log('5. Type invalide:', type)
      return NextResponse.json({ 
        success: false, 
        error: 'Type invalide' 
      }, { status: 400 })
    }

    console.log('6. Recherche de l\'élément:', type, itemId)
    const existingItem = type === 'video' 
      ? await prisma.video.findUnique({ where: { id: itemId } })
      : await prisma.formation.findUnique({ where: { id: itemId } })

    if (!existingItem) {
      console.log('7. Élément non trouvé')
      return NextResponse.json({ 
        success: false, 
        error: `${type} non trouvé` 
      }, { status: 404 })
    }
    console.log('7. Élément trouvé:', existingItem.id)

    console.log('8. Tentative d\'upsert history')
    const history = await prisma.history.upsert({
      where: {
        userId_type_itemId: {
          userId: session.user.id,
          type,
          itemId,
        }
      },
      update: {
        timestamp,
        duration,
        lastViewedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        type,
        itemId,
        timestamp,
        duration: duration || null,
        lastViewedAt: new Date(),
      },
    })
    console.log('9. History créé/mis à jour avec succès:', history)

    return NextResponse.json({ 
      success: true, 
      data: history 
    })
  } catch (error) {
    console.error('Erreur complète history:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
