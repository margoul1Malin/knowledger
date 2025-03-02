'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import DataTable from '@/app/components/admin/DataTable'

type Category = {
  id: string
  name: string
  createdAt: string
  _count: {
    articles: number
    videos: number
    formations: number
  }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Erreur lors du chargement des catégories')
      const data = await res.json()
      setCategories(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/categories/${id}`, {
            method: 'DELETE',
          })
        )
      )
      // Rafraîchir la liste après suppression
      fetchCategories()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const columns = [
    {
      field: 'name',
      header: 'Nom',
    },
    {
      field: '_count',
      header: 'Contenus',
      render: (count: Category['_count']) => (
        <div className="flex gap-2">
          <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
            {count.articles} articles
          </span>
          <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
            {count.videos} vidéos
          </span>
          <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
            {count.formations} formations
          </span>
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
        <h1 className="text-2xl font-bold">Catégories</h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle catégorie
        </Link>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        onDelete={handleDelete}
        editUrl={(category) => `/admin/categories/${category.id}/edit`}
      />
    </div>
  )
} 