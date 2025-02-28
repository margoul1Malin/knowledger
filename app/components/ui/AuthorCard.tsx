'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { User } from '@prisma/client'

type AuthorWithStats = {
  id: string
  name: string
  image: string | null
  role: string
  publicProfile?: {
    bio: string | null
    expertise: string[]
  } | null
  _count?: {
    articles: number
    videos: number
    formations: number
  }
  articles?: number
  videos?: number
  formations?: number
}

export default function AuthorCard({ author }: { author: AuthorWithStats }) {
  // Adapter les statistiques selon la structure disponible
  const stats = {
    articles: author._count?.articles ?? author.articles ?? 0,
    videos: author._count?.videos ?? author.videos ?? 0,
    formations: author._count?.formations ?? author.formations ?? 0
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <Link href={`/publicprofiles/${author.id}`}>
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={author.image || '/default-avatar.png'}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                {author.name}
              </h3>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {author.role === 'ADMIN' ? 'Administrateur' : 'Formateur'}
              </span>
            </div>

            {author.publicProfile?.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {author.publicProfile.bio}
              </p>
            )}

            {author.publicProfile?.expertise && (
              <div className="flex flex-wrap gap-2 mt-3">
                {author.publicProfile.expertise.slice(0, 3).map((exp) => (
                  <span
                    key={exp}
                    className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <div className="text-lg font-semibold">{stats.articles}</div>
                <div className="text-xs text-muted-foreground">Articles</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.videos}</div>
                <div className="text-xs text-muted-foreground">Vidéos</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{stats.formations}</div>
                <div className="text-xs text-muted-foreground">Formations</div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
