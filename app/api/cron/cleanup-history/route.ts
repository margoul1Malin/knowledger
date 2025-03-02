import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

// Durée de conservation en jours
const RETENTION_DAYS = 30

export async function POST(req: Request) {
  try {
    const headersList = headers()
    const cronSecret = headersList.get('x-cron-secret')

    // Vérifier le secret pour la sécurité
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Calculer la date limite (30 jours avant aujourd'hui)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)

    // Supprimer les entrées d'historique plus anciennes que la date limite
    const { count } = await prisma.history.deleteMany({
      where: {
        lastViewedAt: {
          lt: cutoffDate
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${count} entrées d'historique supprimées`,
      deletedBefore: cutoffDate
    })
  } catch (error) {
    console.error('Erreur lors du nettoyage de l\'historique:', error)
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage de l\'historique' },
      { status: 500 }
    )
  }
} 