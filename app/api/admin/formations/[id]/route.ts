import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Supprimer les relations VideoFormation
    await prisma.videoFormation.deleteMany({
      where: { formationId: params.id }
    })

    // Supprimer les achats
    await prisma.purchase.deleteMany({
      where: { 
        itemId: params.id,
        type: 'formation'
      }
    })

    // Supprimer la formation
    await prisma.formation.delete({
      where: { id: params.id }
    })

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
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formation = await prisma.formation.findUnique({
      where: { id: params.id }
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