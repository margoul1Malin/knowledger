'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import DataTable from '@/app/components/admin/DataTable'

export default function AdminFormations() {
  const [formations, setFormations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFormations = async () => {
    try {
      const res = await fetch('/api/formations')
      if (!res.ok) throw new Error('Erreur lors du chargement des formations')
      const data = await res.json()
      setFormations(data.items || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFormations()
  }, [])

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/formations/${id}`, {
            method: 'DELETE',
          })
        )
      )
      // Rafraîchir la liste après suppression
      fetchFormations()
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
      field: 'createdAt',
      header: 'Date de création',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
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
      field: 'price',
      header: 'Prix',
      render: (value: number) => value ? `${value}€` : 'Gratuit',
    },
  ]

  if (isLoading) {
    return <div className="text-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Formations</h1>
        <Link
          href="/create-content/formation"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle formation
        </Link>
      </div>

      <DataTable
        data={formations}
        columns={columns}
        onDelete={handleDelete}
        editUrl={(formation) => `/formations/${formation.slug}/edit`}
      />
    </div>
  )
} 