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

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!results) {
    return <div>Aucun résultat trouvé</div>
  }

  return (
    <Tabs defaultValue="articles" className="w-full">
      <TabsList className="w-full flex flex-wrap gap-2 bg-transparent">
        <TabsTrigger value="articles" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Articles</span>
          <span className="ml-1">({results.articles.length})</span>
        </TabsTrigger>
        <TabsTrigger value="videos" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Video className="h-4 w-4" />
          <span className="hidden sm:inline">Vidéos</span>
          <span className="ml-1">({results.videos.length})</span>
        </TabsTrigger>
        <TabsTrigger value="formations" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <GraduationCap className="h-4 w-4" />
          <span className="hidden sm:inline">Formations</span>
          <span className="ml-1">({results.formations.length})</span>
        </TabsTrigger>
        <TabsTrigger value="formators" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Formateurs</span>
          <span className="ml-1">({results.formators.length})</span>
        </TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[600px] max-w-7xl rounded-md mx-auto">
        <TabsContent value="articles" className="mt-6 space-y-4 ">
          {results.articles.map((article) => (
            <Link 
              href={`/articles/${article.slug}`} 
              key={article.id}
              className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {article.imageUrl && (
                <div className="w-full sm:w-48 h-32 relative rounded-md overflow-hidden">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {article.content}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{article.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDistance(new Date(article.createdAt), new Date(), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="videos" className="mt-6 space-y-4">
          {results.videos.map((video) => (
            <Link 
              href={`/videos/${video.slug}`} 
              key={video.id}
              className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {video.coverImage && (
                <div className="w-full sm:w-48 h-32 relative rounded-md overflow-hidden">
                  <Image
                    src={video.coverImage}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {video.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{video.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDistance(new Date(video.createdAt), new Date(), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="formations" className="mt-6 space-y-4">
          {results.formations.map((formation) => (
            <Link 
              href={`/formations/${formation.slug}`} 
              key={formation.id}
              className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {formation.imageUrl && (
                <div className="w-full sm:w-48 h-32 relative rounded-md overflow-hidden">
                  <Image
                    src={formation.imageUrl}
                    alt={formation.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-2 line-clamp-2">{formation.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {formation.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{formation.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDistance(new Date(formation.createdAt), new Date(), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="formators" className="mt-6 space-y-4">
          {results.formators.map((formator) => (
            <div 
              key={formator.id}
              className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg border bg-card"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden">
                <Image
                  src={formator.image || '/images/default-avatar.png'}
                  alt={formator.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="font-semibold mb-2">{formator.name}</h3>
                {formator.publicProfile?.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formator.publicProfile.bio}
                  </p>
                )}
                {formator.publicProfile?.expertise && (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    {formator.publicProfile.expertise.map((skill: string) => (
                      <span 
                        key={skill}
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}
