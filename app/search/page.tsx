import { Suspense } from 'react'
import SearchResults from './SearchResults'

export default function SearchPage({
  searchParams
}: {
  searchParams: { q: string }
}) {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Résultats pour "{searchParams.q}"
          </h1>
          <Suspense fallback={<div>Chargement...</div>}>
            <SearchResults query={searchParams.q} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
