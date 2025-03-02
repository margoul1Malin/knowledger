'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import DataTable from '@/app/components/admin/DataTable'

type VideoFormationType = {
  id: string
  order: number
  coverImage: string | null
  createdAt: string
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

  const fetchVideoFormations = async () => {
    try {
      const res = await fetch('/api/admin/videoformations')
      if (!res.ok) throw new Error('Erreur lors du chargement des vidéos de formation')
      const data = await res.json()
      setVideoFormations(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideoFormations()
  }, [])

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/videoformations/${id}`, {
            method: 'DELETE',
          })
        )
      )
      // Rafraîchir la liste après suppression
      fetchVideoFormations()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const columns = [
    {
      field: 'video',
      header: 'Vidéo',
      render: (video: VideoFormationType['video']) => (
        <div className="flex items-center gap-3">
          {video.coverImage && (
            <img
              src={video.coverImage}
              alt={video.title}
              className="h-12 w-20 object-cover rounded"
            />
          )}
          <span>{video.title}</span>
        </div>
      ),
    },
    {
      field: 'formation',
      header: 'Formation',
      render: (formation: VideoFormationType['formation']) => formation.title,
    },
    {
      field: 'order',
      header: 'Ordre',
      render: (value: number) => `#${value + 1}`,
    },
    {
      field: 'createdAt',
      header: 'Date d\'ajout',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ]

  if (isLoading) {
    return <div className="text-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vidéos de formation</h1>
        <Link
          href="/admin/videoformations/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle vidéo de formation
        </Link>
      </div>

      <DataTable
        data={videoFormations}
        columns={columns}
        onDelete={handleDelete}
        editUrl={(vf) => `/admin/videoformations/${vf.id}/edit`}
      />
    </div>
  )
}
