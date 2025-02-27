'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { User, Article, Video, Formation } from '@prisma/client'
import { 
  GlobeAltIcon, 
  MapPinIcon, 
  LinkIcon 
} from '@heroicons/react/24/outline'

type ProfileWithAll = User & {
  publicProfile: {
    bio: string | null
    expertise: string[]
    location: string | null
    socialLinks: any
    website: string | null
    github: string | null
  } | null
  articles: Article[]
  videos: Video[]
  formations: Formation[]
}

export default function ProfileHeader({ profile }: { profile: ProfileWithAll }) {
  return (
    <div className="container mx-auto px-4 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-8"
      >
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image
              src={profile.image || '/default-avatar.png'}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                {profile.name}
              </h1>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {profile.role === 'ADMIN' ? 'Administrateur' : 'Formateur'}
              </span>
            </div>

            {profile.publicProfile?.expertise && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.publicProfile.expertise.map((exp) => (
                  <span
                    key={exp}
                    className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            )}

            <p className="text-muted-foreground mb-6">
              {profile.publicProfile?.bio || 'Aucune description disponible'}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {profile.publicProfile?.location && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{profile.publicProfile.location}</span>
                </div>
              )}

              {profile.publicProfile?.website && (
                <a
                  href={profile.publicProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  <span>Site web</span>
                </a>
              )}

              {profile.publicProfile?.github && (
                <a
                  href={profile.publicProfile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground">
                {profile.articles.length}
              </div>
              <div className="text-sm text-muted-foreground">Articles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">
                {profile.videos.length}
              </div>
              <div className="text-sm text-muted-foreground">Vidéos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">
                {profile.formations.length}
              </div>
              <div className="text-sm text-muted-foreground">Formations</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
