import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/parcours
export async function GET() {
  try {
    const parcours = await prisma.parcours.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(parcours)
  } catch (error) {
    console.error('Erreur lors de la récupération des parcours:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des parcours' },
      { status: 500 }
    )
  }
}

// POST /api/parcours
export async function POST(req: Request) {
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

    // Création du slug à partir du titre
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Création du parcours avec ses formations
    const parcours = await prisma.parcours.create({
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
    console.error('Erreur lors de la création du parcours:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du parcours' },
      { status: 500 }
    )
  }
} 