'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function AdminFormations() {
  const [formations, setFormations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFormations = async () => {
    try {
      const res = await fetch('/api/formations')
      if (!res.ok) throw new Error('Erreur lors du chargement des formations')
      const data = await res.json()
      setFormations(data.items)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFormations()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return

    try {
      const res = await fetch(`/api/admin/formations/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      await fetchFormations()
    } catch (error) {
      console.error('Erreur:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Formations</h1>
          <div className="animate-pulse w-32 h-10 bg-muted rounded-lg"></div>
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="animate-pulse">
            <div className="bg-muted h-12 px-6 flex items-center">
              <div className="h-4 bg-muted-foreground/20 rounded w-24"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 border-t border-border">
                <div className="h-6 bg-muted-foreground/20 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Formations</h1>
        <Link
          href="/create-content/formation"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5" />
          Créer une formation
        </Link>
      </div>

      {formations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucune formation n'a été créée pour le moment.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-sm font-medium">Titre</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Auteur</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Prix</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Vidéos</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {formations.map((formation: any) => (
                <tr key={formation.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm text-foreground">{formation.title}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{formation.author.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formation.isPremium ? `${formation.price}€` : 'Gratuit'}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex flex-wrap gap-2">
                      {formation.videos && formation.videos.length > 0 ? (
                        formation.videos.map((vf: any) => (
                          <span
                            key={vf.id}
                            className="px-2 py-1 text-xs bg-muted rounded-full flex items-center gap-1"
                          >
                            <span>{vf.video.title}</span>
                            <span className="text-muted-foreground">#{vf.order + 1}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Aucune vidéo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Link
                      href={`/admin/formations/${formation.id}/edit`}
                      className="text-primary hover:text-primary/80"
                    >
                      <PencilIcon className="h-5 w-5 inline" />
                    </Link>
                    <button
                      onClick={() => handleDelete(formation.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 