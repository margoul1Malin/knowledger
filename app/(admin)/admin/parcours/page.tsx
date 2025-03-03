'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from '@/app/components/ui/button'
import { useRouter } from 'next/navigation'

interface Parcours {
  id: string
  title: string
  description: string
  slug: string
  imageUrl: string
  createdAt: string
  formations: {
    order: number
    formation: {
      title: string
    }
  }[]
}

export default function ParcoursAdminPage() {
  const [parcours, setParcours] = useState<Parcours[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Charger les parcours au montage du composant
  useEffect(() => {
    fetch('/api/parcours')
      .then(res => res.json())
      .then(data => {
        setParcours(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des parcours:', error)
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce parcours ?')) {
      return
    }

    try {
      const res = await fetch(`/api/parcours/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setParcours(parcours.filter(p => p.id !== id))
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Gestion des Parcours</h1>
        <Button asChild>
          <Link href="/admin/parcours/new" className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Nouveau Parcours
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {parcours.map((parcours) => (
          <div
            key={parcours.id}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="flex items-start gap-6 p-6">
              {/* Image du parcours */}
              <div className="relative w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={parcours.imageUrl}
                  alt={parcours.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Informations du parcours */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {parcours.title}
                </h2>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {parcours.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {parcours.formations.length} formation{parcours.formations.length > 1 ? 's' : ''}
                  </span>
                  <span>
                    Créé le {format(new Date(parcours.createdAt), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/admin/parcours/${parcours.id}/edit`)}
                >
                  <PencilIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(parcours.id)}
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {parcours.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Aucun parcours n'a encore été créé.
          </div>
        )}
      </div>
    </div>
  )
} 