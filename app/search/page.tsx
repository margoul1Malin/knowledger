import { Suspense } from 'react'
import SearchResults from './SearchResults'

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q: string }
}) {
  const query = searchParams.q || ''

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Résultats pour "{query}"
          </h1>
          <Suspense fallback={<div>Chargement...</div>}>
            <SearchResults query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
