'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { VideoCameraIcon, DocumentIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

type SearchResult = {
  id: string
  type: 'article' | 'video' | 'formation'
  title: string
  description: string
  slug: string
  imageUrl?: string
  coverImage?: string
}

export default function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error('Erreur lors de la recherche')
        const data = await res.json()
        setResults(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aucun résultat trouvé pour "{query}"
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.id}`}
          href={`/${result.type}s/${result.slug}`}
          className="flex gap-6 p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors"
        >
          <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-muted">
            {(result.imageUrl || result.coverImage) && (
              <Image
                src={result.imageUrl || result.coverImage || ''}
                alt={result.title}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {result.type === 'article' && (
                <DocumentIcon className="h-5 w-5 text-primary" />
              )}
              {result.type === 'video' && (
                <VideoCameraIcon className="h-5 w-5 text-primary" />
              )}
              {result.type === 'formation' && (
                <AcademicCapIcon className="h-5 w-5 text-primary" />
              )}
              <span className="text-sm text-muted-foreground capitalize">
                {result.type}
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-2">{result.title}</h2>
            <p className="text-muted-foreground line-clamp-2">
              {result.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
