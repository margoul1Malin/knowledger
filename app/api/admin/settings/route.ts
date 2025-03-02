import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Non autorisé', { status: 401 })
    }

    let settings = await prisma.adminSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          maintenanceMode: false,
          registrationsClosed: false
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Non autorisé', { status: 401 })
    }

    const data = await req.json()
    let settings = await prisma.adminSettings.findFirst()

    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          maintenanceMode: false,
          registrationsClosed: false,
          ...data
        }
      })
    } else {
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data
      })
    }

    // Mettre à jour les cookies
    const cookieStore = cookies()
    cookieStore.set('maintenanceMode', settings.maintenanceMode.toString(), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    cookieStore.set('registrationsClosed', settings.registrationsClosed.toString(), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
} 