'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function AdminArticles() {
  const [articles, setArticles] = useState([])

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles')
      if (!res.ok) throw new Error('Erreur lors du chargement des articles')
      const data = await res.json()
      setArticles(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      await fetchArticles()
    } catch (error) {
      console.error('Erreur:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link
          href="/create-content/article"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5" />
          Créer un article
        </Link>
      </div>

      <div className="grid gap-4">
        {articles.map((article: any) => (
          <div key={article.id} className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{article.title}</h3>
                <p className="text-sm text-muted-foreground">{article.content.substring(0, 100)}...</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(article.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 