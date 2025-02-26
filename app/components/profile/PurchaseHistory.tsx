'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

interface Purchase {
  id: string
  type: 'article' | 'video' | 'formation'
  price: number
  createdAt: string
  item: {
    title: string
    slug: string
    imageUrl?: string
  }
}

export default function PurchaseHistory() {
  const { data: session } = useSession()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchPurchases()
    }
  }, [session])

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`/api/purchases/user/${session?.user.id}`)
      if (!res.ok) throw new Error('Erreur lors de la récupération des achats')
      const data = await res.json()
      setPurchases(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-card rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground text-center">
          Vous n'avez pas encore effectué d'achats
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="space-y-4">
        {purchases.map((purchase) => (
          <Link
            key={purchase.id}
            href={`/${purchase.type}s/${purchase.item.slug}`}
            className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={purchase.item.imageUrl || '/placeholder.png'}
                  alt={purchase.item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{purchase.item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Acheté le {new Date(purchase.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <span className="text-primary font-semibold">{purchase.price}€</span>
          </Link>
        ))}
      </div>
    </div>
  )
} 