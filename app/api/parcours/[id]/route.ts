import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/parcours/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const parcours = await prisma.parcours.findUnique({
      where: {
        id: params.id
      },
      include: {
        formations: {
          include: {
            formation: true
          }
        }
      }
    })

    if (!parcours) {
      return NextResponse.json(
        { error: 'Parcours non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(parcours)
  } catch (error) {
    console.error('Erreur lors de la récupération du parcours:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du parcours' },
      { status: 500 }
    )
  }
}

// PUT /api/parcours/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description, imageUrl, formations } = body

    // Validation des données
    if (!title || !description || !imageUrl || !formations) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Mise à jour du slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Supprimer d'abord les relations existantes
    await prisma.formationParcours.deleteMany({
      where: {
        parcoursId: params.id
      }
    })

    // Mettre à jour le parcours et créer les nouvelles relations
    const parcours = await prisma.parcours.update({
      where: {
        id: params.id
      },
      data: {
        title,
        description,
        slug,
        imageUrl,
        formations: {
          create: formations.map((f: { formationId: string, order: number }) => ({
            formationId: f.formationId,
            order: f.order
          }))
        }
      },
      include: {
        formations: {
          include: {
            formation: {
              select: {
                title: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(parcours)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du parcours:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du parcours' },
      { status: 500 }
    )
  }
}

// DELETE /api/parcours/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = params

    // Supprimer d'abord les relations avec les formations
    await prisma.formationParcours.deleteMany({
      where: {
        parcoursId: id
      }
    })

    // Supprimer le parcours
    await prisma.parcours.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du parcours:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du parcours' },
      { status: 500 }
    )
  }
} 