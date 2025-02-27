'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { User, PublicProfileAddons } from '@prisma/client'

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

type ProfileWithAddons = User & {
  publicProfile: PublicProfileAddons | null
  _count: {
    articles: number
    videos: number
    formations: number
  }
}

export default function PublicProfilesList({ 
  profiles 
}: { 
  profiles: ProfileWithAddons[] 
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {profiles.map((profile) => (
        <motion.div
          key={profile.id}
          variants={item}
          className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all hover:shadow-lg"
        >
          <Link href={`/publicprofiles/${profile.id}`}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={profile.image || '/default-avatar.png'}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {profile.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {profile.role === 'ADMIN' ? 'Administrateur' : 'Formateur'}
                  </p>
                  {profile.publicProfile?.expertise && (
                    <div className="flex gap-2 mt-1">
                      {profile.publicProfile.expertise.slice(0, 2).map((exp) => (
                        <span
                          key={exp}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {exp}
                        </span>
                      ))}
                      {profile.publicProfile.expertise.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{profile.publicProfile.expertise.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-2 mb-4">
                {profile.publicProfile?.bio || 'Aucune description disponible'}
              </p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {profile._count.articles}
                  </div>
                  <div className="text-sm text-muted-foreground">Articles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {profile._count.videos}
                  </div>
                  <div className="text-sm text-muted-foreground">Vidéos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {profile._count.formations}
                  </div>
                  <div className="text-sm text-muted-foreground">Formations</div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
