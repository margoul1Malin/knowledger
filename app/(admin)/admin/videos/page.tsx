'use client'

import { useState, useEffect } from 'react'
import { Video } from '@prisma/client'
import { XMarkIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos')
      if (!res.ok) throw new Error('Erreur lors de la récupération des vidéos')
      const data = await res.json()
      setVideos(data)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue lors du chargement des vidéos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette vidéo ?')) return

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      await fetchVideos()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue lors de la suppression')
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
        <h1 className="text-3xl font-bold">Gestion des Vidéos</h1>
        <Link
          href="/create-content/video"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Nouvelle Vidéo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Miniature de la vidéo */}
            <div className="relative aspect-video">
              <Image
                src={video.coverImage}
                alt={video.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Informations de la vidéo */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{video.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                  {video.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm">
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
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
                  onClick={() => handleDeleteVideo(video.id)}
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

      {videos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucune vidéo n'a été créée pour le moment.
        </div>
      )}
    </div>
  )
} 