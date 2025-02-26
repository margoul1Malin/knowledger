import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
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
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
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