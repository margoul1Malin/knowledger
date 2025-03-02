'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type SearchResult = {
  id: string
  title?: string
  name?: string
  email?: string
  type: 'article' | 'video' | 'formation' | 'user' | 'category' | 'videoFormation'
  createdAt: string
  slug?: string
}

export default function AdminSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Erreur lors de la recherche')
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (result: SearchResult) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return

    try {
      const endpoint = `/api/admin/${result.type}s/${result.id}`
      const res = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      // Rafraîchir les résultats
      setResults(results.filter(r => r.id !== result.id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleEdit = (result: SearchResult) => {
    const editUrls: Record<string, string> = {
      article: `/articles/${result.slug}/edit`,
      video: `/videos/${result.slug}/edit`,
      formation: `/formations/${result.slug}/edit`,
      user: `/admin/users`,
      category: `/admin/categories`,
      videoFormation: `/admin/videoformations/${result.id}/edit`
    }

    const url = editUrls[result.type]
    if (url) {
      router.push(url)
    }
  }

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(result => result.type === activeTab)

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      article: 'Article',
      video: 'Vidéo',
      formation: 'Formation',
      user: 'Utilisateur',
      category: 'Catégorie',
      videoFormation: 'Vidéo de formation'
    }
    return labels[type] || type
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Recherche Administrative</h1>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher des articles, vidéos, formations, utilisateurs..."
            className="w-full px-4 py-2 pl-10 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          Rechercher
        </button>
      </div>

      {results.length > 0 && (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Tout ({results.length})</TabsTrigger>
            <TabsTrigger value="article">
              Articles ({results.filter(r => r.type === 'article').length})
            </TabsTrigger>
            <TabsTrigger value="video">
              Vidéos ({results.filter(r => r.type === 'video').length})
            </TabsTrigger>
            <TabsTrigger value="formation">
              Formations ({results.filter(r => r.type === 'formation').length})
            </TabsTrigger>
            <TabsTrigger value="user">
              Utilisateurs ({results.filter(r => r.type === 'user').length})
            </TabsTrigger>
            <TabsTrigger value="category">
              Catégories ({results.filter(r => r.type === 'category').length})
            </TabsTrigger>
            <TabsTrigger value="videoFormation">
              Vidéos de formation ({results.filter(r => r.type === 'videoFormation').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-4">
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div>
                    <h3 className="font-medium">
                      {result.title || result.name || result.email}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                        {getTypeLabel(result.type)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(result.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(result)}
                      className="p-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(result)}
                      className="p-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Recherche en cours...</p>
        </div>
      )}

      {!isLoading && query && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun résultat trouvé pour "{query}"
        </div>
      )}
    </div>
  )
} 