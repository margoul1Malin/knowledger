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

    // Vérifier si on demande les formations suivies
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'formations-progress') {
      // Récupérer toutes les vidéos regardées groupées par formation
      const watchedVideos = await prisma.history.findMany({
        where: {
          userId: session.user.id,
          type: 'video'
        },
        include: {
          video: {
            select: {
              id: true,
              formations: {
                select: {
                  formation: {
                    select: {
                      id: true,
                      title: true,
                      imageUrl: true,
                      slug: true,
                      videos: {
                        select: {
                          order: true,
                          video: {
                            select: {
                              id: true
                            }
                          }
                        }
                      }
                    }
                  },
                  order: true
                }
              }
            }
          }
        },
        orderBy: {
          lastViewedAt: 'desc'
        }
      })

      // Regrouper par formation
      const formationsProgress = watchedVideos.reduce((acc, history) => {
        const videoFormation = history.video?.formations[0]
        if (!videoFormation) return acc

        const formation = videoFormation.formation
        if (!formation) return acc

        if (!acc[formation.id]) {
          acc[formation.id] = {
            id: formation.id,
            title: formation.title,
            imageUrl: formation.imageUrl,
            slug: formation.slug,
            totalVideos: formation.videos.length,
            watchedVideos: new Set(),
            lastWatchedVideo: {
              order: videoFormation.order,
              timestamp: history.timestamp
            }
          }
        }

        acc[formation.id].watchedVideos.add(history.video.id)

        // Mettre à jour la dernière vidéo regardée si celle-ci est plus récente
        if (history.lastViewedAt > acc[formation.id].lastWatchedVideo.lastViewedAt) {
          acc[formation.id].lastWatchedVideo = {
            order: videoFormation.order,
            timestamp: history.timestamp,
            lastViewedAt: history.lastViewedAt
          }
        }

        return acc
      }, {})

      // Transformer en tableau et calculer les pourcentages
      const formationsArray = Object.values(formationsProgress).map(formation => ({
        ...formation,
        progress: (formation.watchedVideos.size / formation.totalVideos) * 100,
        watchedVideos: formation.watchedVideos.size
      }))

      return NextResponse.json({
        success: true,
        data: formationsArray
      })
    }

    // Sinon, retourner l'historique normal
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
            slug: true,
            formations: {
              select: {
                formation: {
                  select: {
                    slug: true
                  }
                },
                order: true
              },
              take: 1
            }
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
      },
      orderBy: {
        lastViewedAt: 'desc'
      }
    })

    // Transformer les données pour avoir une structure plus propre
    const formattedHistory = history.map(item => ({
      ...item,
      video: item.video ? {
        ...item.video,
        formation: item.video.formations?.[0] ? {
          slug: item.video.formations[0].formation.slug,
          videoOrder: item.video.formations[0].order
        } : null
      } : null
    }))

    return NextResponse.json({ success: true, data: formattedHistory })
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
