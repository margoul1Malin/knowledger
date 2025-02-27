'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Formation } from '@prisma/client'
import { motion } from 'framer-motion'

type FormationWithAuthor = Formation & {
  author: {
    name: string
    image: string | null
  }
}

export default function FormationCard({ formation }: { formation: FormationWithAuthor }) {
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
                  <span>{Math.round(formation.duration)} min</span>
                </>
              )}
            </div>
            {formation.price && (
              <div className="text-primary font-semibold">
                {formation.price}€
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
