'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import DataTable from '@/app/components/admin/DataTable'
import { formatDuration } from '@/lib/utils'

type VideoWithFormations = {
  id: string
  title: string
  description: string
  videoUrl: string
  duration: number
  isPremium: boolean
  createdAt: string
  slug: string
  VideoFormation: {
    formation: {
      title: string
      slug: string
    }
  }[]
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoWithFormations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos')
      if (!res.ok) throw new Error('Erreur lors du chargement des vidéos')
      const data = await res.json()
      setVideos(data.items || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/videos/${id}`, {
            method: 'DELETE',
          })
        )
      )
      // Rafraîchir la liste après suppression
      fetchVideos()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const columns = [
    {
      field: 'title',
      header: 'Titre',
    },
    {
      field: 'duration',
      header: 'Durée',
      render: (value: number) => formatDuration(value),
    },
    {
      field: 'isPremium',
      header: 'Premium',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value 
            ? 'bg-primary/20 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}>
          {value ? 'Premium' : 'Gratuit'}
        </span>
      ),
    },
    {
      field: 'VideoFormation',
      header: 'Formations',
      render: (formations: VideoWithFormations['VideoFormation']) => (
        <div className="flex flex-wrap gap-1">
          {formations && formations.length > 0 ? (
            formations.map((vf, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
              >
                {vf.formation.title}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">Aucune formation</span>
          )}
        </div>
      ),
    },
    {
      field: 'createdAt',
      header: 'Date de création',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ]

  if (isLoading) {
    return <div className="text-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vidéos</h1>
        <Link
          href="/create-content/video"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle vidéo
        </Link>
      </div>

      <DataTable
        data={videos}
        columns={columns}
        onDelete={handleDelete}
        editUrl={(video) => `/videos/${video.slug}/edit`}
      />
    </div>
  )
} 