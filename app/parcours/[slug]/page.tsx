'use client'

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import TreeView, { TreeNode } from '@/app/components/ui/TreeView'
import { Loader2 } from 'lucide-react'

interface History {
  itemId: string
  timestamp: number
  duration: number
  type: 'video' | 'formation'
  lastViewedAt: string
}

interface Parcours {
  id: string
  title: string
  description: string
  slug: string
  imageUrl: string
  imagePublicId?: string
  createdAt: Date
  updatedAt: Date
}

interface Formation {
  id: string
  title: string
  description: string
  slug: string
  imageUrl: string
  imagePublicId?: string
  isPremium: boolean
  price?: number
  duration?: number
  createdAt: Date
  updatedAt: Date
  authorId: string
  categoryId: string
}

interface ParcoursWithFormations extends Parcours {
  formations: {
    order: number
    formation: Formation & {
      videos: {
        order: number
        video: {
          id: string
          title: string
          slug: string
          isPremium: boolean
          duration?: number
        }
      }[]
    }
  }[]
}

export default function ParcoursPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const { user } = useAuth()
  const [parcours, setParcours] = useState<ParcoursWithFormations | null>(null)
  const [history, setHistory] = useState<History[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger le parcours
        const parcoursResponse = await fetch(`/api/parcours/slug/${resolvedParams.slug}`)
        if (!parcoursResponse.ok) {
          throw new Error('Parcours non trouvé')
        }
        const parcoursData = await parcoursResponse.json()
        setParcours(parcoursData)

        // Charger l'historique si l'utilisateur est connecté
        if (user) {
          const historyResponse = await fetch('/api/history')
          if (historyResponse.ok) {
            const historyData = await historyResponse.json()
            console.log('Historique reçu:', historyData)
            
            // Vérifier la structure de la réponse
            if (historyData.success && Array.isArray(historyData.data)) {
              setHistory(historyData.data)
            } else if (Array.isArray(historyData)) {
              setHistory(historyData)
            } else if (historyData.items && Array.isArray(historyData.items)) {
              setHistory(historyData.items)
            } else {
              console.error('Format d\'historique inattendu:', historyData)
              setHistory([])
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err)
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.slug, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !parcours) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="text-center text-destructive">
            {error || 'Parcours non trouvé'}
          </div>
        </div>
      </div>
    )
  }

  // Calculer la progression des vidéos
  const getVideoProgress = (videoId: string): number => {
    console.log('Calcul de la progression pour la vidéo:', videoId)
    console.log('Historique disponible:', history)
    
    const videoHistory = history.find(h => h.itemId === videoId && h.type === 'video')
    
    if (!videoHistory) {
      console.log('Aucun historique trouvé pour la vidéo:', videoId)
      return 0
    }
    
    // Si on n'a pas de durée, on considère qu'on a regardé 100% si on a un timestamp
    if (!videoHistory.duration) {
      return videoHistory.timestamp > 0 ? 100 : 0
    }
    
    const progress = Math.min(100, (videoHistory.timestamp / (videoHistory.duration * 60)) * 100)
    console.log('Progression calculée:', progress)
    return progress
  }

  // Calculer la progression des formations
  const getFormationProgress = (videos: { video: { id: string, duration?: number } }[]): number => {
    if (videos.length === 0) return 0
    console.log('Calcul de la progression pour les vidéos:', videos.map(v => v.video.id))
    const totalProgress = videos.reduce((sum, { video }) => sum + getVideoProgress(video.id), 0)
    const progress = totalProgress / videos.length
    console.log('Progression moyenne de la formation:', progress)
    return progress
  }

  // Calculer la progression globale du parcours
  const getParcoursProgress = (formations: ParcoursWithFormations['formations']): number => {
    if (formations.length === 0) return 0
    const totalProgress = formations.reduce((sum, { formation }) => 
      sum + getFormationProgress(formation.videos), 0)
    return totalProgress / formations.length
  }

  // Transformer les formations en structure d'arbre
  const treeData: TreeNode[] = [{
    title: parcours.title,
    progress: getParcoursProgress(parcours.formations),
    children: [...parcours.formations]
      .sort((a, b) => a.order - b.order)
      .map(({ formation, order }) => {
        const formationProgress = getFormationProgress(formation.videos)
        return {
          title: `${order + 1}. ${formation.title}`,
          progress: formationProgress,
          links: [{
            href: `/formations/${formation.slug}`,
            label: 'Accéder à la formation',
            roles: formation.isPremium ? ['ADMIN', 'FORMATOR', 'PREMIUM'] : undefined,
            progress: formationProgress
          }],
          children: formation.videos
            ? [...formation.videos]
                .sort((a, b) => a.order - b.order)
                .map(({ video, order }) => {
                  const videoHistory = history.find(h => h.itemId === video.id && h.type === 'video')
                  const videoProgress = getVideoProgress(video.id)
                  return {
                    title: `${order + 1}. ${video.title}`,
                    progress: videoProgress,
                    links: [{
                      href: `/formations/${formation.slug}?video=${order + 1}&t=${videoHistory?.timestamp || 0}`,
                      label: 'Regarder la vidéo',
                      roles: video.isPremium ? ['ADMIN', 'FORMATOR', 'PREMIUM'] : undefined,
                      progress: videoProgress
                    }]
                  }
                })
            : []
        }
      })
  }]

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            {parcours.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {parcours.description}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <TreeView
            data={treeData}
            userRole={user?.role}
            className="mt-8"
          />
        </div>
      </div>
    </div>
  )
} 