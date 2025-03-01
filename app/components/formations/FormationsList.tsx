'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlayIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useAuth } from '@/app/hooks/useAuth'
import PurchaseModal from '@/app/components/PurchaseModal'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Pagination from '@/app/components/ui/Pagination'
import StarRating from '@/app/components/formations/StarRating'

interface Formation {
  id: string
  title: string
  description: string
  imageUrl: string
  isPremium: boolean
  price: number | null
  slug: string
  author: {
    name: string
    image: string | null
  }
  averageRating: number
  totalRatings: number
  hasPurchased?: boolean
  lastWatched?: {
    videoOrder: number
    timestamp: number
  } | null
}

interface PaginationData {
  total: number
  pages: number
  page: number
  limit: number
}

interface FormationsListProps {
  initialFormations: Formation[]
  pagination: PaginationData
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function FormationsList({ initialFormations, pagination: initialPagination }: FormationsListProps) {
  const { user } = useAuth()
  const [formations, setFormations] = useState<Formation[]>(initialFormations)
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState(initialPagination)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1')
    if (page !== pagination.page) {
      fetchFormations(page)
    }
  }, [searchParams])

  const fetchFormations = async (page: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/formations?page=${page}`)
      if (!res.ok) throw new Error('Erreur lors de la récupération des formations')
      const data = await res.json()
      setFormations(data.items)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFormationClick = (formation: Formation) => {
    if (!formation.isPremium || formation.hasPurchased || ['PREMIUM', 'ADMIN', 'FORMATOR'].includes(user?.role || '')) {
      if (formation.lastWatched) {
        router.push(`/formations/${formation.slug}?video=${formation.lastWatched.videoOrder}&t=${formation.lastWatched.timestamp}`)
        return
      }
      router.push(`/formations/${formation.slug}`)
      return
    }
    
    setSelectedFormation(formation)
    setShowPurchaseModal(true)
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {formations.map((formation) => (
          <motion.article
            key={formation.id}
            variants={item}
            className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg cursor-pointer"
            onClick={() => handleFormationClick(formation)}
          >
            <div className="aspect-video relative bg-muted">
              <Image
                src={formation.imageUrl}
                alt={formation.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayIcon className="h-12 w-12 text-white" />
              </div>
              {formation.isPremium && (
                <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                  {formation.hasPurchased ? 'Acheté' : `${formation.price}€`}
                </div>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {formation.title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {formation.description}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Par {formation.author.name}
                </span>
                {formation.price && !formation.hasPurchased && (
                  <div className="text-primary font-semibold">
                    {formation.price}€
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StarRating 
                  rating={formation.averageRating} 
                  size="sm" 
                />
                <span className="text-xs text-muted-foreground">
                  ({formation.totalRatings})
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>

      {selectedFormation && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false)
            setSelectedFormation(null)
          }}
          item={selectedFormation}
          type="formation"
        />
      )}

      <div className="mt-8">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  )
} 