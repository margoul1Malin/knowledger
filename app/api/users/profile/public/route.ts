import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (!['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { bio, expertise, location, website, github, socialLinks } = body

    // Valider les URLs
    const urlFields = { website, github }
    for (const [field, url] of Object.entries(urlFields)) {
      if (url && !isValidUrl(url)) {
        return NextResponse.json(
          { error: `URL invalide pour le champ ${field}` },
          { status: 400 }
        )
      }
    }

    // Mettre à jour ou créer le profil public
    const updatedProfile = await prisma.publicProfileAddons.upsert({
      where: {
        userId: session.user.id
      },
      create: {
        userId: session.user.id,
        bio,
        expertise,
        location,
        website,
        github,
        socialLinks
      },
      update: {
        bio,
        expertise,
        location,
        website,
        github,
        socialLinks
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProfile
    })

  } catch (error) {
    console.error('Erreur mise à jour profil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Fonction utilitaire pour valider les URLs
function isValidUrl(url: string): boolean {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const profile = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        publicProfile: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Erreur récupération profil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
