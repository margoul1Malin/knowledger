'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import DataTable from '@/app/components/admin/DataTable'

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles')
      if (!res.ok) throw new Error('Erreur lors du chargement des articles')
      const data = await res.json()
      setArticles(data.items || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/articles/${id}`, {
            method: 'DELETE',
          })
        )
      )
      // Rafraîchir la liste après suppression
      fetchArticles()
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
  ]

  if (isLoading) {
    return <div className="text-center p-8">Chargement...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link
          href="/create-content/article"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvel article
        </Link>
      </div>

      <DataTable
        data={articles}
        columns={columns}
        onDelete={handleDelete}
        editUrl={(article) => `/articles/${article.slug}/edit`}
      />
    </div>
  )
} 