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

  // Fonction pour charger l'historique
  const loadHistory = async () => {
    if (!user) return
    try {
      const historyResponse = await fetch('/api/history', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        console.log('Historique reçu:', historyData)
        
        let newHistory: History[] = []
        if (historyData.success && Array.isArray(historyData.data)) {
          newHistory = historyData.data
        } else if (Array.isArray(historyData)) {
          newHistory = historyData
        } else if (historyData.items && Array.isArray(historyData.items)) {
          newHistory = historyData.items
        }

        // Vérifier si l'historique a changé avant de mettre à jour l'état
        const hasChanged = JSON.stringify(newHistory) !== JSON.stringify(history)
        if (hasChanged) {
          console.log('Mise à jour de l\'historique détectée')
          setHistory(newHistory)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
    }
  }

  // Écouter les événements de mise à jour de l'historique
  useEffect(() => {
    const handleHistoryUpdate = () => {
      console.log('Événement de mise à jour de l\'historique reçu')
      loadHistory()
    }

    // Ajouter l'écouteur d'événements
    window.addEventListener('history-updated', handleHistoryUpdate)

    // Rafraîchir l'historique toutes les 5 secondes
    const intervalId = setInterval(loadHistory, 5000)

    // Charger l'historique immédiatement
    loadHistory()

    return () => {
      window.removeEventListener('history-updated', handleHistoryUpdate)
      clearInterval(intervalId)
    }
  }, [user])

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

        // Charger l'historique initial
        await loadHistory()
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
  const getVideoProgress = (videoId: string): { progress: number, isValidated: boolean } => {
    console.log('Calcul de la progression pour la vidéo:', videoId)
    
    const videoHistory = history.find(h => h.itemId === videoId && h.type === 'video')
    
    if (!videoHistory) {
      console.log('Aucun historique trouvé pour la vidéo:', videoId)
      return { progress: 0, isValidated: false }
    }

    console.log('Historique trouvé:', videoHistory)
    
    // Considérer une vidéo comme "vue" si on a regardé au moins 2 minutes
    const minTimeToComplete = 2 * 60 // 2 minutes en secondes
    const progress = videoHistory.timestamp >= minTimeToComplete ? 100 : (videoHistory.timestamp / minTimeToComplete) * 100
    
    // Une vidéo est validée si elle a été regardée à plus de 90%
    const isValidated = progress >= 90
    
    console.log('Progression calculée:', {
      timestamp: videoHistory.timestamp,
      minTimeToComplete,
      progress,
      isValidated
    })
    
    return { progress, isValidated }
  }

  // Calculer la progression des formations
  const getFormationProgress = (videos: { video: { id: string, duration?: number } }[]): { progress: number, isValidated: boolean } => {
    if (videos.length === 0) return { progress: 0, isValidated: false }
    
    const videoProgresses = videos.map(({ video }) => getVideoProgress(video.id))
    const totalProgress = videoProgresses.reduce((sum, { progress }) => sum + progress, 0)
    const progress = totalProgress / videos.length
    
    // Une formation est validée si toutes ses vidéos sont validées
    const isValidated = videoProgresses.every(({ isValidated }) => isValidated)
    
    console.log('Progression moyenne de la formation:', { progress, isValidated })
    return { progress, isValidated }
  }

  // Calculer la progression globale du parcours
  const getParcoursProgress = (formations: ParcoursWithFormations['formations']): { progress: number, isValidated: boolean } => {
    if (formations.length === 0) return { progress: 0, isValidated: false }
    
    const formationProgresses = formations.map(({ formation }) => 
      getFormationProgress(formation.videos)
    )
    
    const totalProgress = formationProgresses.reduce((sum, { progress }) => sum + progress, 0)
    const progress = totalProgress / formations.length
    
    // Un parcours est validé si toutes ses formations sont validées
    const isValidated = formationProgresses.every(({ isValidated }) => isValidated)
    
    return { progress, isValidated }
  }

  // Transformer les formations en structure d'arbre
  const treeData: TreeNode[] = [{
    title: parcours.title,
    progress: getParcoursProgress(parcours.formations).progress,
    isValidated: getParcoursProgress(parcours.formations).isValidated,
    children: [...parcours.formations]
      .sort((a, b) => a.order - b.order)
      .map(({ formation, order }) => {
        const { progress, isValidated } = getFormationProgress(formation.videos)
        return {
          title: `${order + 1}. ${formation.title}`,
          progress,
          isValidated,
          links: [{
            href: `/formations/${formation.slug}`,
            label: 'Accéder à la formation',
            roles: formation.isPremium ? ['ADMIN', 'FORMATOR', 'PREMIUM'] : undefined,
            progress
          }],
          children: formation.videos
            ? [...formation.videos]
                .sort((a, b) => a.order - b.order)
                .map(({ video, order }) => ({
                  title: `${order + 1}. ${video.title}`,
                  progress: getVideoProgress(video.id).progress,
                  isValidated: getVideoProgress(video.id).isValidated,
                  links: [{
                    href: `/formations/${formation.slug}?videoIndex=${order + 1}&t=${
                      history.find(h => h.itemId === video.id && h.type === 'video')?.timestamp || 0
                    }`,
                    label: 'Regarder la vidéo',
                    roles: video.isPremium ? ['ADMIN', 'FORMATOR', 'PREMIUM'] : undefined,
                    progress: getVideoProgress(video.id).progress
                  }]
                }))
            : []
        }
      })
  }]

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
         <div className="text-center max-w-3xl mx-auto mb-16">
         <p className="text-lg text-muted-foreground">
            {parcours.description}
          </p>
          <p className="text-lg text-foreground">
            Click on the Numbers to show content.
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