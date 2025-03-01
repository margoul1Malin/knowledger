'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { Video } from '@prisma/client'
import { XMarkIcon, PencilIcon, EyeIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

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
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos')
      if (!res.ok) throw new Error('Erreur lors du chargement des vidéos')
      const data = await res.json()
      setVideos(data.items || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les vidéos',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) return

    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Erreur lors de la suppression')

      toast({
        title: 'Succès',
        description: 'La vidéo a été supprimée'
      })

      fetchVideos()
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la vidéo',
        variant: 'destructive'
      })
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
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium">{video.title}</h3>
                <p className="text-sm text-muted-foreground">{video.description}</p>
                {video.VideoFormation && video.VideoFormation.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      Utilisée dans les formations :
                      {video.VideoFormation.map((vf, index) => (
                        <Link
                          key={index}
                          href={`/formations/${vf.formation.slug}`}
                          className="text-primary hover:underline ml-1"
                        >
                          {vf.formation.title}
                          {index < video.VideoFormation.length - 1 ? ',' : ''}
                        </Link>
                      ))}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/videos/${video.slug}/edit`}>
                  <Button variant="ghost" size="sm">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(video.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 