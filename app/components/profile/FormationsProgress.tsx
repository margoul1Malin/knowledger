'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlayIcon } from '@heroicons/react/24/solid'
import { Progress } from '@/components/ui/progress'

interface FormationProgress {
  id: string
  title: string
  imageUrl: string
  slug: string
  totalVideos: number
  watchedVideos: number
  progress: number
  lastWatchedVideo: {
    order: number
    timestamp: number
    lastViewedAt: string
  }
}

export default function FormationsProgress() {
  const [formations, setFormations] = useState<FormationProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch('/api/history?type=formations-progress')
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des formations')
        }
        const data = await response.json()
        if (data.success) {
          setFormations(data.data)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchFormations()
  }, [])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold">Formations suivies</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Formations suivies</h2>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (formations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Formations suivies</h2>
        <p className="text-muted-foreground">
          Vous n'avez pas encore commencé de formation
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Formations suivies</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Continuez votre apprentissage
        </p>
      </div>

      <div className="grid gap-4">
        {formations.map((formation) => (
          <Link
            key={formation.id}
            href={`/formations/${formation.slug}?video=${formation.lastWatchedVideo.order}&t=${formation.lastWatchedVideo.timestamp}`}
            className="block group"
          >
            <div className="flex gap-4 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors">
              <div className="relative w-40 h-24 rounded-lg overflow-hidden">
                <Image
                  src={formation.imageUrl}
                  alt={formation.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{formation.title}</h3>
                <div className="mt-2 space-y-2">
                  <Progress value={formation.progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{Math.round(formation.progress)}% terminé</span>
                    <span>{formation.watchedVideos}/{formation.totalVideos} vidéos</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 