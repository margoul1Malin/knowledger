'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistance } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  Video, 
  GraduationCap, 
  Users,
  Clock,
  User
} from 'lucide-react'

interface SearchResult {
  articles: any[]
  videos: any[]
  formations: any[]
  formators: any[]
}

export default function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Erreur lors de la recherche')
        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError('Une erreur est survenue lors de la recherche')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  if (isLoading) {
    return <div>Recherche en cours...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  if (!results) {
    return null
  }

  const hasResults = 
    results.articles.length > 0 || 
    results.videos.length > 0 || 
    results.formations.length > 0 ||
    results.formators.length > 0

  if (!hasResults) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Aucun résultat trouvé pour "{query}"
        </p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="articles" className="w-full">
      <TabsList className="mb-8">
        <TabsTrigger value="articles" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Articles ({results.articles.length})
        </TabsTrigger>
        <TabsTrigger value="videos" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Vidéos ({results.videos.length})
        </TabsTrigger>
        <TabsTrigger value="formations" className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Formations ({results.formations.length})
        </TabsTrigger>
        <TabsTrigger value="formators" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Formateurs ({results.formators.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="articles">
        <div className="space-y-6">
          {results.articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="block bg-card hover:bg-accent/50 border border-border rounded-lg p-4 transition-colors"
            >
              <div className="flex gap-4">
                <div className="relative w-32 h-24">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {article.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistance(new Date(article.createdAt), new Date(), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="videos">
        <div className="space-y-6">
          {results.videos.map((video) => (
            <Link
              key={video.id}
              href={`/videos/${video.slug}`}
              className="block bg-card hover:bg-accent/50 border border-border rounded-lg p-4 transition-colors"
            >
              <div className="flex gap-4">
                <div className="relative w-32 h-24">
                  <Image
                    src={video.coverImage}
                    alt={video.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {video.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistance(new Date(video.createdAt), new Date(), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="formations">
        <div className="space-y-6">
          {results.formations.map((formation) => (
            <Link
              key={formation.id}
              href={`/formations/${formation.slug}`}
              className="block bg-card hover:bg-accent/50 border border-border rounded-lg p-4 transition-colors"
            >
              <div className="flex gap-4">
                <div className="relative w-32 h-24">
                  <Image
                    src={formation.imageUrl}
                    alt={formation.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{formation.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formation.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {formation.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistance(new Date(formation.createdAt), new Date(), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="formators">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.formators.map((formator) => (
            <Link
              key={formator.id}
              href={`/publicprofiles/${formator.id}`}
              className="block bg-card hover:bg-accent/50 border border-border rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={formator.image || '/default-avatar.png'}
                    alt={formator.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{formator.name}</h3>
                  {formator.publicProfile?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {formator.publicProfile.bio}
                    </p>
                  )}
                  {formator.publicProfile?.expertise && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formator.publicProfile.expertise.slice(0, 3).map((exp: string) => (
                        <span
                          key={exp}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
