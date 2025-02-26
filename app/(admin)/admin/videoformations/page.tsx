'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

type VideoFormationType = {
  id: string
  order: number
  coverImage: string | null
  video: {
    title: string
    videoUrl: string
    coverImage: string
    slug: string
  }
  formation: {
    title: string
    slug: string
  }
}

export default function AdminVideoFormationsPage() {
  const [videoFormations, setVideoFormations] = useState<VideoFormationType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVideoFormations()
  }, [])

  const fetchVideoFormations = async () => {
    try {
      const res = await fetch('/api/admin/videoformations')
      if (!res.ok) throw new Error('Erreur lors de la récupération des vidéos de formation')
      const data = await res.json()
      setVideoFormations(data)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue lors du chargement des vidéos de formation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo de la formation ?')) return

    try {
      const res = await fetch(`/api/admin/videoformations/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      await fetchVideoFormations()
    } catch (error) {
      console.error('Erreur:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des Vidéos de Formation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoFormations.map((vf) => (
          <div 
            key={vf.id} 
            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-video">
              <Image
                src={vf.coverImage || vf.video.coverImage}
                alt={vf.video.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Ordre: {vf.order + 1}
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{vf.video.title}</h3>
                <Link 
                  href={`/formations/${vf.formation.slug}`}
                  className="text-primary hover:underline text-sm"
                >
                  Formation: {vf.formation.title}
                </Link>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Link
                  href={`/videos/${vf.video.slug}`}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  title="Voir la vidéo"
                >
                  <EyeIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleDelete(vf.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  title="Retirer de la formation"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videoFormations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucune vidéo n'a été ajoutée à une formation pour le moment.
        </div>
      )}
    </div>
  )
}
