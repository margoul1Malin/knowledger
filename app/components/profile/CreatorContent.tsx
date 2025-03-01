'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  VideoCameraIcon, 
  DocumentTextIcon, 
  AcademicCapIcon,
  PlusIcon,
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast";

interface ContentStats {
  articles: number
  videos: number
  formations: number
  totalViews: number
  totalStudents: number
}

interface Content {
  articles: any[]
  videos: any[]
  formations: any[]
}

export default function CreatorContent() {
  const [content, setContent] = useState<Content>({
    articles: [],
    videos: [],
    formations: []
  })
  const [stats, setStats] = useState<ContentStats>({
    articles: 0,
    videos: 0,
    formations: 0,
    totalViews: 0,
    totalStudents: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setError(null)
      const res = await fetch('/api/users/content')
      console.log('Réponse status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération du contenu')
      }
      
      const data = await res.json()
      console.log('Données reçues:', data)
      
      setContent(data)
      
      // Calculer les statistiques
      setStats({
        articles: data.articles.length,
        videos: data.videos.length,
        formations: data.formations.length,
        totalViews: calculateTotalViews(data),
        totalStudents: calculateTotalStudents(data)
      })
    } catch (error) {
      console.error('Erreur complète:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la récupération du contenu')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalViews = (data: Content) => {
    const videoViews = data.videos.reduce((acc, video) => acc + (video.views || 0), 0)
    const formationViews = data.formations.reduce((acc, formation) => acc + (formation.views || 0), 0)
    return videoViews + formationViews
  }

  const calculateTotalStudents = (data: Content) => {
    const videoStudents = new Set(data.videos.flatMap(video => video.students || []))
    const formationStudents = new Set(data.formations.flatMap(formation => formation.students || []))
    return new Set([...videoStudents, ...formationStudents]).size
  }

  const handleDelete = async (type: string, id: string) => {
    try {
      const response = await fetch(`/api/users/content/${type}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Une erreur est survenue");
      }

      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
              <div className="h-8 bg-muted rounded w-24 mb-4"></div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-card rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchContent}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contenus créés</p>
              <p className="text-2xl font-bold">
                {stats.articles + stats.videos + stats.formations}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <EyeIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vues totales</p>
              <p className="text-2xl font-bold">{stats.totalViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Étudiants</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Articles</h3>
              <p className="text-sm text-muted-foreground">{stats.articles} articles publiés</p>
            </div>
          </div>
          <Link
            href="/create-content/article"
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nouvel article</span>
          </Link>
        </div>
        {content.articles.length > 0 ? (
          <div className="grid gap-4">
            {content.articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="flex justify-between items-center p-4 bg-muted/50 hover:bg-muted rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-4">
                  {article.imageUrl && (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      width={80}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {article.isPremium && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        Premium
                      </span>
                    )}
                    <span>{article.views || 0} vues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/articles/${article.slug}/edit`)
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete('article', article.id)
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Vous n'avez pas encore créé d'articles
          </p>
        )}
      </div>

      {/* Vidéos */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <VideoCameraIcon className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Vidéos</h3>
              <p className="text-sm text-muted-foreground">{stats.videos} vidéos publiées</p>
            </div>
          </div>
          <Link
            href="/create-content/video"
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nouvelle vidéo</span>
          </Link>
        </div>
        {content.videos.length > 0 ? (
          <div className="grid gap-4">
            {content.videos.map((video) => (
              <div
                key={video.id}
                className="flex justify-between items-center p-4 bg-muted/50 hover:bg-muted rounded-lg group transition-colors"
              >
                <Link
                  href={`/videos/${video.slug}`}
                  className="flex items-center gap-4 flex-1"
                >
                  <Image
                    src={video.coverImage}
                    alt={video.title}
                    width={120}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(video.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {video.category && (
                      <span className="text-xs text-muted-foreground">
                        {video.category.name}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/videos/${video.slug}/edit`}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete('video', video.id)}
                    className="p-2 text-destructive hover:text-destructive/80"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Vous n'avez pas encore créé de vidéos
          </p>
        )}
      </div>

      {/* Formations */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Formations</h3>
              <p className="text-sm text-muted-foreground">{stats.formations} formations publiées</p>
            </div>
          </div>
          <Link
            href="/create-content/formation"
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nouvelle formation</span>
          </Link>
        </div>
        {content.formations.length > 0 ? (
          <div className="grid gap-4">
            {content.formations.map((formation) => (
              <Link
                key={formation.id}
                href={`/formations/${formation.slug}`}
                className="flex justify-between items-center p-4 bg-muted/50 hover:bg-muted rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={formation.imageUrl}
                    alt={formation.title}
                    width={120}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      {formation.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {new Date(formation.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <span className="text-sm text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        {formation.videos?.length || 0} vidéos
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {formation.isPremium && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        Premium
                      </span>
                    )}
                    <span>{formation.views || 0} vues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/formations/${formation.slug}/edit`)
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete('formation', formation.id)
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Vous n'avez pas encore créé de formations
          </p>
        )}
      </div>
    </div>
  )
} 