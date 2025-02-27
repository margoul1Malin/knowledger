'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  DocumentTextIcon, 
  VideoCameraIcon, 
  AcademicCapIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

type Purchase = {
  id: string
  type: 'article' | 'video' | 'formation'
  price: number
  createdAt: string
  article?: {
    id: string
    title: string
    imageUrl: string
    slug: string
  }
  video?: {
    id: string
    title: string
    coverImage: string
    slug: string
  }
  formation?: {
    id: string
    title: string
    imageUrl: string
    slug: string
  }
}

export default function AchatsPage() {
  const { data: session } = useSession()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await fetch('/api/users/purchases')
        if (!res.ok) throw new Error('Erreur lors de la récupération des achats')
        const data = await res.json()
        setPurchases(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPurchases()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'article':
        return DocumentTextIcon
      case 'video':
        return VideoCameraIcon
      case 'formation':
        return AcademicCapIcon
      default:
        return DocumentTextIcon
    }
  }

  const getContent = (purchase: Purchase) => {
    switch (purchase.type) {
      case 'article':
        return purchase.article
      case 'video':
        return purchase.video
      case 'formation':
        return purchase.formation
      default:
        return null
    }
  }

  const getImageUrl = (content: Purchase['article'] | Purchase['video'] | Purchase['formation']) => {
    if (!content) return ''
    if ('coverImage' in content) return content.coverImage
    return content.imageUrl
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mes Achats</h1>

      {purchases.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Vous n'avez pas encore effectué d'achats
        </div>
      ) : (
        <div className="grid gap-4">
          {purchases.map((purchase) => {
            const content = getContent(purchase)
            if (!content) return null
            const Icon = getIcon(purchase.type)

            return (
              <Link
                key={purchase.id}
                href={`/${purchase.type}s/${content.slug}`}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors group"
              >
                <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(content)}
                    alt={content.title}
                    fill
                    className="object-cover"
                  />
                  {purchase.type !== 'article' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground capitalize">
                      {purchase.type}
                    </span>
                  </div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Acheté le {new Date(purchase.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
} 