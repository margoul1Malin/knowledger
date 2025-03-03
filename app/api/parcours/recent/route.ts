import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const recentParcours = await prisma.parcours.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(recentParcours)
  } catch (error) {
    console.error('[RECENT_PARCOURS_GET]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
} 