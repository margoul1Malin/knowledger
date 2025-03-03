import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const parcours = await prisma.parcours.findUnique({
      where: {
        slug: params.slug
      },
      include: {
        formations: {
          include: {
            formation: {
              include: {
                videos: {
                  include: {
                    video: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                        isPremium: true
                      }
                    }
                  }
                }
              }
            }
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