import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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
              title: true,
              duration: true,
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
                          orderId: true,
                          video: {
                            select: {
                              id: true,
                              duration: true
                            }
                          }
                        },
                        orderBy: {
                          orderId: 'asc'
                        }
                      }
                    }
                  },
                  order: true,
                  orderId: true
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
      const formationsProgress = watchedVideos.reduce((acc: any, history) => {
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
            totalDuration: formation.videos.reduce((sum: number, v: any) => sum + (v.video.duration || 0), 0),
            watchedVideos: new Set(),
            watchedDuration: 0,
            lastWatchedVideo: {
              order: videoFormation.order,
              orderId: videoFormation.orderId,
              timestamp: history.timestamp,
              lastViewedAt: history.lastViewedAt
            }
          }
        }

        // Ajouter la vidéo à l'ensemble des vidéos regardées
        if (history.video && !acc[formation.id].watchedVideos.has(history.video.id)) {
          acc[formation.id].watchedVideos.add(history.video.id)
          acc[formation.id].watchedDuration += history.video.duration || 0
        }

        // Mettre à jour la dernière vidéo regardée si celle-ci est plus récente
        if (history.lastViewedAt > acc[formation.id].lastWatchedVideo.lastViewedAt) {
          acc[formation.id].lastWatchedVideo = {
            order: videoFormation.order,
            orderId: videoFormation.orderId,
            timestamp: history.timestamp,
            lastViewedAt: history.lastViewedAt
          }
        }

        return acc
      }, {})

      // Transformer en tableau et calculer les pourcentages
      const formationsArray = Object.values(formationsProgress).map((formation: any) => ({
        ...formation,
        progress: Math.round((formation.watchedDuration / formation.totalDuration) * 100),
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
            duration: true,
            formations: {
              select: {
                formation: {
                  select: {
                    slug: true,
                    title: true,
                    videos: {
                      select: {
                        videoId: true,
                        orderId: true
                      },
                      orderBy: {
                        orderId: 'asc'
                      }
                    }
                  }
                },
                orderId: true
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
    const formattedHistory = history.map(item => {
      if (!item.video || !item.video.formations?.[0]) {
        return item;
      }

      const formation = item.video.formations[0].formation;
      const videoIndex = formation.videos.findIndex(v => v.videoId === item.video?.id);
      
      return {
        ...item,
        video: {
          ...item.video,
          formation: {
            slug: formation.slug,
            title: formation.title,
            videoOrder: videoIndex + 1 // L'index commence à 0, donc on ajoute 1
          }
        }
      };
    });

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

    const body = await request.json()
    const { type, itemId, timestamp, formationId } = body

    if (!type || !itemId || timestamp === undefined) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Si c'est une vidéo et qu'on a un formationId, vérifier que la vidéo appartient à la formation
    if (type === 'video' && formationId) {
      const videoFormation = await prisma.videoFormation.findFirst({
        where: {
          formationId: formationId,
          videoId: itemId
        }
      })

      if (!videoFormation) {
        return NextResponse.json(
          { error: 'Cette vidéo n\'appartient pas à la formation' },
          { status: 400 }
        )
      }
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
