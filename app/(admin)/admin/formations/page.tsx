'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

export default function AdminFormations() {
  const [formations, setFormations] = useState([])

  useEffect(() => {
    fetch('/api/formations')
      .then(res => res.json())
      .then(data => setFormations(data))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette formation ?')) return
    
    try {
      const res = await fetch(`/api/formations/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Erreur lors de la suppression')

      setFormations(formations.filter((f: any) => f.id !== id))
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Gestion des formations</h1>
        <Link
          href="/create-content/formation"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Nouvelle formation
        </Link>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Titre</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Auteur</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Prix</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Vidéos</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
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
                    {formation.videos.map((vf: any) => (
                      <span
                        key={vf.id}
                        className="px-2 py-1 text-xs bg-muted rounded-full flex items-center gap-1"
                      >
                        <span>{vf.video.title}</span>
                        <span className="text-muted-foreground">#{vf.order + 1}</span>
                      </span>
                    ))}
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
    </div>
  )
} 