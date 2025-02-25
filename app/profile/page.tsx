'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  UserCircleIcon, 
  VideoCameraIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/hooks/useAuth'

type UserContent = {
  articles: any[]
  videos: any[]
  formations: any[]
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { user } = useAuth()
  const [userContent, setUserContent] = useState<UserContent>({
    articles: [],
    videos: [],
    formations: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const showPremiumBanner = user?.role === 'NORMAL'
  const [purchases, setPurchases] = useState([])

  useEffect(() => {
    if (session?.user && ['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      fetchUserContent()
    } else {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session?.user) {
      fetchPurchases()
    }
  }, [session])

  const fetchUserContent = async () => {
    try {
      const res = await fetch(`/api/users/${session?.user.id}/content`)
      if (!res.ok) throw new Error('Erreur lors de la récupération du contenu')
      const data = await res.json()
      setUserContent(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`/api/purchases/user/${session?.user.id}`)
      if (!res.ok) throw new Error('Erreur lors de la récupération des achats')
      const data = await res.json()
      setPurchases(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Profil */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-6 mb-6">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || ''}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-20 w-20 text-muted-foreground" />
              )}
              <div>
                <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
                <p className="text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {showPremiumBanner && (
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Passez à l'offre Premium
                  </h2>
                  <p className="text-muted-foreground">
                    Accédez à tout le contenu et profitez de fonctionnalités exclusives.
                  </p>
                </div>
                <Link
                  href="/premium"
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>Devenir Premium</span>
                </Link>
              </div>
            </div>
          )}

          {/* Section Contenu (ADMIN et FORMATOR) */}
          {['ADMIN', 'FORMATOR'].includes(session?.user?.role || '') && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold">Votre contenu</h2>

              {/* Articles */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-medium">Articles</h3>
                  </div>
                  <Link
                    href="/create-content/article"
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Nouvel article
                  </Link>
                </div>
                {userContent.articles.length > 0 ? (
                  <div className="grid gap-4">
                    {userContent.articles.map((article) => (
                      <div
                        key={article.id}
                        className="flex justify-between items-center p-4 bg-muted rounded-lg"
                      >
                        <span>{article.title}</span>
                        <Link
                          href={`/articles/${article.slug}`}
                          className="text-primary hover:underline"
                        >
                          Voir
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun article créé</p>
                )}
              </div>

              {/* Vidéos */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <VideoCameraIcon className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-medium">Vidéos</h3>
                  </div>
                  <Link
                    href="/create-content/video"
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Nouvelle vidéo
                  </Link>
                </div>
                {userContent.videos.length > 0 ? (
                  <div className="grid gap-4">
                    {userContent.videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex justify-between items-center p-4 bg-muted rounded-lg"
                      >
                        <span>{video.title}</span>
                        <Link
                          href={`/videos/${video.slug}`}
                          className="text-primary hover:underline"
                        >
                          Voir
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune vidéo créée</p>
                )}
              </div>

              {/* Formations */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <AcademicCapIcon className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-medium">Formations</h3>
                  </div>
                  <Link
                    href="/create-content/formation"
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Nouvelle formation
                  </Link>
                </div>
                {userContent.formations.length > 0 ? (
                  <div className="grid gap-4">
                    {userContent.formations.map((formation) => (
                      <div
                        key={formation.id}
                        className="flex justify-between items-center p-4 bg-muted rounded-lg"
                      >
                        <span>{formation.title}</span>
                        <Link
                          href={`/formations/${formation.slug}`}
                          className="text-primary hover:underline"
                        >
                          Voir
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucune formation créée</p>
                )}
              </div>
            </div>
          )}

          {/* Section Achats */}
          {purchases.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <h2 className="text-xl font-semibold mb-6">Mes achats</h2>
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <Link
                    key={purchase.id}
                    href={`/${purchase.type}s/${purchase.item.slug}`}
                    className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={purchase.item.imageUrl || '/placeholder.png'}
                        alt={purchase.item.title}
                        width={60}
                        height={60}
                        className="rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium">{purchase.item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Acheté le {new Date(purchase.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-primary font-semibold">{purchase.price}€</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 