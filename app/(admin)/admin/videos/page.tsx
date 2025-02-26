'use client'

import { useState, useEffect } from 'react'
import { Video } from '@prisma/client'
import { XMarkIcon, PencilIcon, EyeIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

type VideoWithFormations = Video & {
  VideoFormation: {
    formation: {
      title: string;
      slug: string;
    }
  }[]
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoWithFormations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos')
      if (!res.ok) throw new Error('Erreur lors de la récupération des vidéos')
      const data = await res.json()
      setVideos(data.items)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue lors du chargement des vidéos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) return

    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      await fetchVideos()
    } catch (error) {
      console.error('Erreur:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des Vidéos</h1>
          <div className="animate-pulse w-32 h-10 bg-muted rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-video bg-muted"></div>
              <div className="p-4 space-y-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des Vidéos</h1>
        <Link
          href="/create-content/video"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Nouvelle Vidéo
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucune vidéo n'a été créée pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-video">
                <Image
                  src={video.coverImage}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
                {video.VideoFormation && video.VideoFormation.length > 0 && (
                  <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <AcademicCapIcon className="h-4 w-4" />
                    Formation
                  </div>
                )}
              </div>

              <div className="p-4">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{video.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                    {video.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm mt-2">
                  {video.isPremium && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                      Premium
                    </span>
                  )}
                  {video.price && (
                    <span className="px-2 py-1 bg-muted rounded-full">
                      {video.price}€
                    </span>
                  )}
                  {video.VideoFormation && video.VideoFormation.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.VideoFormation.map((vf) => (
                        <Link
                          key={vf.formation.slug}
                          href={`/formations/${vf.formation.slug}`}
                          className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs hover:bg-secondary/20 transition-colors"
                        >
                          {vf.formation.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-4">
                  <Link
                    href={`/videos/${video.slug}`}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    title="Voir"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>
                  <Link
                    href={`/admin/videos/${video.id}/edit`}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    title="Modifier"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Supprimer"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 