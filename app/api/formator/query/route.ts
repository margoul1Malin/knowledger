import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const formatorQuery = await prisma.formatorQuery.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        skills: data.skills,
        wantArticles: data.wantArticles,
        wantVideos: data.wantVideos,
        wantFormations: data.wantFormations,
        cvUrl: data.cvUrl || null,
        message: data.message,
      }
    })

    // Ici, vous pourriez ajouter l'envoi d'un email de notification à l'administrateur
    // et un email de confirmation au candidat

    return NextResponse.json(formatorQuery)
  } catch (error) {
    console.error('[FORMATOR_QUERY_POST]', error)
    return new NextResponse('Erreur interne', { status: 500 })
  }
} 