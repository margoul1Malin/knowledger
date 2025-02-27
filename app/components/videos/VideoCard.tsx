'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Video } from '@prisma/client'
import { motion } from 'framer-motion'
import { PlayIcon } from '@heroicons/react/24/outline'

type VideoWithAuthor = Video & {
  author: {
    name: string
    image: string | null
  }
}

export default function VideoCard({ video }: { video: VideoWithAuthor }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
    >
      <Link href={`/videos/${video.slug}`}>
        <div className="relative aspect-video">
          <Image
            src={video.coverImage}
            alt={video.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <PlayIcon className="w-12 h-12 text-white" />
          </div>
          {video.isPremium && (
            <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm">
              Premium
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 mb-4">
            {video.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Par {video.author.name}
            </span>
            {video.duration && (
              <span className="text-muted-foreground">
                {Math.round(video.duration)} min
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
