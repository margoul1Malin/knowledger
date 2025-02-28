'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Formation } from '@prisma/client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import StarRating from './StarRating'

type FormationWithAuthor = Formation & {
  author: {
    name: string
    image: string | null
  }
}

interface RatingData {
  average: number
  total: number
}

export default function FormationCard({ formation }: { formation: FormationWithAuthor }) {
  const [ratingData, setRatingData] = useState<RatingData | null>(null)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch(`/api/formations/${formation.id}/rate`)
        if (response.ok) {
          const data = await response.json()
          setRatingData({
            average: data.average,
            total: data.total
          })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error)
      }
    }

    fetchRatings()
  }, [formation.id])

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
    >
      <Link href={`/formations/${formation.slug}`}>
        <div className="relative aspect-video">
          <Image
            src={formation.imageUrl}
            alt={formation.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {formation.isPremium && (
            <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm">
              Premium
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {formation.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 mb-4">
            {formation.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Par {formation.author.name}</span>
              {formation.duration && (
                <>
                  <span>•</span>
                  <span>{formatDuration(formation.duration)}</span>
                </>
              )}
            </div>
            {formation.price && (
              <div className="text-primary font-semibold">
                {formation.price}€
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <StarRating 
                rating={ratingData?.average || 0} 
                size="sm"
              />
              {ratingData?.total > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({ratingData.total})
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
