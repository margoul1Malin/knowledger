'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlayIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/solid'

interface HistoryItem {
  id: string
  type: 'video' | 'formation'
  timestamp: number
  lastViewedAt: string
  video?: {
    title: string
    coverImage: string
    slug: string
    formation?: {
      slug: string
      videoOrder: number
    }
  }
  formation?: {
    title: string
    imageUrl: string
    slug: string
  }
}

export default function HistorySection() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history')
      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        // Filtrer pour ne garder que les vidéos qui ne font pas partie d'une formation
        const filteredData = data.data.filter((item: HistoryItem) => 
          item.type === 'video' && !item.video?.formation
        )
        setHistory(filteredData)
        setError(null)
      } else {
        console.error('Format de données invalide:', data)
        setHistory([])
        setError('Format de données invalide')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error)
      setError('Impossible de charger l\'historique')
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const deleteHistoryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      // Mettre à jour l'historique localement
      setHistory(history.filter(item => item.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setError('Erreur lors de la suppression de l\'élément')
    }
  }

  const clearHistory = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch('/api/history', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      setHistory([])
      setError(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setError('Erreur lors de la suppression de l\'historique')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getImageUrl = (item: HistoryItem) => {
    if (item.type === 'video' && item.video) {
      return item.video.coverImage
    }
    if (item.type === 'formation' && item.formation) {
      return item.formation.imageUrl
    }
    return '/placeholder.png'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold">Continuer à regarder</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold">Continuer à regarder</h2>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vidéos récentes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Continuez à regarder vos vidéos
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            disabled={isDeleting}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          >
            Effacer l'historique
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun contenu visionné récemment</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => {
            const content = item.type === 'video' ? item.video : item.formation
            if (!content) return null

            // Déterminer l'URL de redirection
            const href = item.type === 'video' && item.video?.formation
              ? `/formations/${item.video.formation.slug}?video=${item.video.formation.videoOrder}&t=${item.timestamp}`
              : `/${item.type}s/${content.slug}?t=${item.timestamp}`

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-muted/50 hover:bg-muted rounded-lg group transition-colors"
              >
                <Link
                  href={href}
                  className="flex-1 flex items-center gap-4"
                >
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(item)}
                      alt={content.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{content.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        Reprendre à {formatTime(item.timestamp)}
                      </p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.lastViewedAt)}
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className="p-2 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-lg"
                  title="Supprimer de l'historique"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
