import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const formation = await prisma.formation.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            publicProfile: true,
            _count: {
              select: {
                articles: true,
                videos: true,
                formations: true
              }
            }
          }
        },
        videos: {
          include: {
            video: {
              select: {
                id: true,
                title: true,
                description: true,
                videoUrl: true,
                coverImage: true,
                duration: true,
                author: {
                  select: {
                    name: true,
                    image: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        ratings: true
      }
    })

    if (!formation) {
      return new NextResponse("Formation non trouvée", { status: 404 })
    }

    // Calculer la moyenne des notes
    const ratings = formation.ratings || []
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0

    // Vérifier si l'utilisateur connecté a déjà noté
    let userRating = null
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      if (user) {
        const rating = ratings.find(r => r.userId === user.id)
        if (rating) {
          userRating = rating.rating
        }
      }
    }

    // Ajouter les informations de notation à la réponse
    const formationWithRatings = {
      ...formation,
      averageRating,
      totalRatings: ratings.length,
      userRating
    }

    return NextResponse.json(formationWithRatings)
  } catch (error) {
    console.error("[FORMATION_GET]", error)
    return new NextResponse("Erreur interne", { status: 500 })
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

    const formation = await prisma.formation.findUnique({
      where: { slug: params.slug },
      include: {
        author: true,
        videos: {
          include: {
            video: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!formation) {
      return new NextResponse(
        JSON.stringify({ error: 'Formation non trouvée' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Supprimer d'abord les relations VideoFormation
    await prisma.videoFormation.deleteMany({
      where: { formationId: formation.id }
    })

    // Supprimer les achats liés
    await prisma.purchase.deleteMany({
      where: { 
        itemId: formation.id,
        type: 'formation'
      }
    })

    // Supprimer la formation
    await prisma.formation.delete({
      where: { id: formation.id }
    })

    return new NextResponse(
      JSON.stringify({ 
        message: 'Formation supprimée avec succès',
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

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Non autorisé", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse("Utilisateur non trouvé", { status: 404 })
    }

    const formation = await prisma.formation.findUnique({
      where: { slug: params.slug }
    })

    if (!formation) {
      return new NextResponse("Formation non trouvée", { status: 404 })
    }

    const { rating } = await req.json()

    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return new NextResponse("Note invalide", { status: 400 })
    }

    // Vérifier si l'utilisateur a déjà noté cette formation
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_formationId: {
          userId: user.id,
          formationId: formation.id
        }
      }
    })

    let updatedRating
    if (existingRating) {
      // Mettre à jour la note existante
      updatedRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { rating }
      })
    } else {
      // Créer une nouvelle note
      updatedRating = await prisma.rating.create({
        data: {
          rating,
          userId: user.id,
          formationId: formation.id
        }
      })
    }

    // Récupérer les statistiques mises à jour
    const ratings = await prisma.rating.findMany({
      where: { formationId: formation.id }
    })

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

    return NextResponse.json({
      rating: updatedRating,
      average: averageRating,
      total: ratings.length
    })
  } catch (error) {
    console.error("[FORMATION_RATE]", error)
    return new NextResponse("Erreur interne", { status: 500 })
  }
} 