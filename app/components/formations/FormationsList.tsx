'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlayIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { Formation, User } from '@prisma/client'
import { useAuth } from '@/app/hooks/useAuth'
import PurchaseModal from '@/app/components/PurchaseModal'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Pagination from '@/app/components/ui/Pagination'
import StarRating from '@/app/components/formations/StarRating'

type FormationWithAuthor = Formation & {
  author: {
    name: string
    image: string | null
  }
  averageRating: number
  totalRatings: number
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

export default function FormationsList() {
  const { user } = useAuth()
  const [formations, setFormations] = useState<(FormationWithAuthor & { hasPurchased?: boolean })[]>([])
  const [selectedFormation, setSelectedFormation] = useState<FormationWithAuthor | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 15
  })

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    fetchFormations(currentPage)
  }, [currentPage])

  const fetchFormations = async (page: number) => {
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

  const handleFormationClick = (formation: FormationWithAuthor & { hasPurchased?: boolean }) => {
    if (!formation.isPremium || formation.hasPurchased || ['PREMIUM', 'ADMIN', 'FORMATOR'].includes(user?.role || '')) {
      window.location.href = `/formations/${formation.slug}`
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
                {formation.price && (
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

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={handlePageChange}
      />
    </>
  )
} 