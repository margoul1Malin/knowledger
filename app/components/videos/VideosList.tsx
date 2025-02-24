'use client'

import { motion } from 'framer-motion'
import { PlayIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import Image from 'next/image'
import { Video, User } from '@prisma/client'

type VideoWithAuthor = Video & {
  author: User
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

export default function VideosList({ videos }: { videos: VideoWithAuthor[] }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {videos.map((video) => (
        <motion.div
          key={video.id}
          variants={item}
          className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg"
        >
          <div className="aspect-video relative bg-muted">
            <Image
              src={video.coverImage}
              alt={video.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <PlayIcon className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
          </div>
          <div className="p-6">
            <Link href={`/videos/${video.slug}`}>
              <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {video.title}
              </h2>
            </Link>
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {video.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Par {video.author.name}
              </span>
              <Link 
                href={`/videos/${video.slug}`}
                className="text-primary hover:text-primary/80"
              >
                Regarder
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
} 