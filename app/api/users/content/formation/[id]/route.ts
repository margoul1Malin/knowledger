import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import slugify from 'slugify'
import { cloudinary } from '@/lib/cloudinary-config'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    const data = await req.json()

    // Vérifier que l'utilisateur est l'auteur de la formation ou admin
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        videos: true
      }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    if (formation.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Générer un nouveau slug si le titre a changé
    const slug = data.title !== formation.title
      ? slugify(data.title, { lower: true })
      : formation.slug

    // Si l'image a changé et qu'il faut mettre à jour les images de couverture des vidéos
    if (data.updateVideoCoverImages && formation.videos.length > 0) {
      console.log('Mise à jour des images de couverture des vidéos');
      // Mettre à jour les images de couverture des vidéos existantes
      await prisma.videoFormation.updateMany({
        where: {
          formationId: id
        },
        data: {
          coverImage: data.imageUrl
        }
      });

      // Mettre également à jour les vidéos elles-mêmes
      const videoIds = formation.videos.map(v => v.videoId);
      await prisma.video.updateMany({
        where: {
          id: {
            in: videoIds
          }
        },
        data: {
          coverImage: data.imageUrl
        }
      });
      
      console.log('Images de couverture mises à jour pour', formation.videos.length, 'vidéos');
    }

    // Mettre à jour la formation
    const updatedFormation = await prisma.formation.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId,
        isPremium: data.isPremium,
        price: data.isPremium ? data.price : null,
        categoryId: data.categoryId,
        slug
      }
    })

    return NextResponse.json(updatedFormation)
  } catch (error) {
    console.error('Erreur lors de la modification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}

// Route pour gérer les vidéos de la formation
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { videos } = await req.json()

    // Vérifier que l'utilisateur est l'auteur de la formation ou admin
    const formation = await prisma.formation.findUnique({
      where: { id: params.id },
      include: {
        videos: true
      }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    if (formation.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Récupérer les vidéos existantes
    const existingVideos = formation.videos.map(v => ({
      videoId: v.videoId,
      order: v.order,
      coverImage: v.coverImage
    }))

    // Identifier les vidéos à supprimer (celles qui ne sont plus dans la liste)
    const videosToKeep = videos.map((v: any) => v.id)
    await prisma.videoFormation.deleteMany({
      where: {
        formationId: params.id,
        videoId: {
          notIn: videosToKeep
        }
      }
    })

    // Mettre à jour l'ordre des vidéos existantes et ajouter les nouvelles
    for (const video of videos) {
      await prisma.videoFormation.upsert({
        where: {
          formationId_videoId: {
            formationId: params.id,
            videoId: video.id
          }
        },
        create: {
          formationId: params.id,
          videoId: video.id,
          order: video.order,
          coverImage: formation.imageUrl
        },
        update: {
          order: video.order
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la modification des vidéos:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification des vidéos' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la formation avec ses vidéos et tous les publicId
    const formation = await prisma.formation.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        imagePublicId: true,
        authorId: true,
        videos: {
          select: {
            video: {
              select: {
                id: true,
                videoPublicId: true,
                coverImagePublicId: true
              }
            }
          }
        }
      }
    })

    if (!formation) {
      return NextResponse.json(
        { error: 'Formation non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est l'auteur ou admin
    if (formation.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Collecter tous les publicId à supprimer
    const resourcesToDelete: Array<{ publicId: string, resourceType: 'image' | 'video' }> = []

    // Ajouter l'image de la formation
    if (formation.imagePublicId) {
      resourcesToDelete.push({
        publicId: formation.imagePublicId,
        resourceType: 'image'
      })
    }

    // Ajouter les vidéos et leurs images de couverture
    formation.videos.forEach(videoFormation => {
      const video = videoFormation.video
      if (video.videoPublicId) {
        resourcesToDelete.push({
          publicId: video.videoPublicId,
          resourceType: 'video'
        })
      }
      if (video.coverImagePublicId) {
        resourcesToDelete.push({
          publicId: video.coverImagePublicId,
          resourceType: 'image'
        })
      }
    })

    // Supprimer toutes les ressources de Cloudinary
    try {
      console.log('Ressources à supprimer:', resourcesToDelete)
      for (const resource of resourcesToDelete) {
        if (!resource.publicId) continue
        
        console.log(`Suppression de la ressource Cloudinary (${resource.resourceType}):`, resource.publicId)
        await cloudinary.uploader.destroy(resource.publicId, {
          resource_type: resource.resourceType
        })
      }
    } catch (cloudinaryError) {
      console.error('Erreur lors de la suppression Cloudinary:', cloudinaryError)
    }

    // Récupérer les IDs des vidéos à supprimer
    const videoIds = formation.videos.map(v => v.video.id)

    // Supprimer toutes les relations et données en une seule transaction
    await prisma.$transaction([
      // Supprimer les relations avec les parcours
      prisma.formationParcours.deleteMany({
        where: { formationId: params.id }
      }),

      // Supprimer les relations VideoFormation
      prisma.videoFormation.deleteMany({
        where: { formationId: params.id }
      }),

      // Supprimer les vidéos elles-mêmes
      prisma.video.deleteMany({
        where: { id: { in: videoIds } }
      }),

      // Supprimer les achats
      prisma.purchase.deleteMany({
        where: {
          itemId: params.id,
          type: 'formation'
        }
      }),

      // Supprimer l'historique
      prisma.history.deleteMany({
        where: {
          itemId: params.id,
          type: 'formation'
        }
      }),

      // Supprimer les commentaires
      prisma.comment.deleteMany({
        where: {
          itemId: params.id,
          itemType: 'formation'
        }
      }),

      // Supprimer les notifications
      prisma.notification.deleteMany({
        where: {
          contentId: params.id,
          contentType: 'formation'
        }
      }),

      // Enfin, supprimer la formation
      prisma.formation.delete({
        where: { id: params.id }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!params.id) {
      return NextResponse.json({ error: 'ID de formation manquant' }, { status: 400 })
    }

    const formation = await prisma.formation.findUnique({
      where: { id: params.id },
      include: {
        author: true,
        category: true,
        videos: {
          include: {
            video: {
              select: {
                id: true,
                title: true,
                description: true,
                videoUrl: true,
                coverImage: true,
                duration: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est l'auteur ou admin
    if (formation.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.json(formation)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    )
  }
} 