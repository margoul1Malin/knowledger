'use client'

import { motion } from 'framer-motion'
import { StarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { Formation, User } from '@prisma/client'

type FormationWithAuthor = Formation & {
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

export default function FormationsList({ formations }: { formations: FormationWithAuthor[] }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {formations.map((formation) => (
        <motion.div
          key={formation.id}
          variants={item}
          className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg"
        >
          <div className="aspect-video relative">
            <Image
              src={formation.imageUrl}
              alt={formation.title}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-medium text-primary">
              {formation.price}€
            </div>
          </div>
          <div className="p-6">
            <Link href={`/formations/${formation.slug}`}>
              <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {formation.title}
              </h2>
            </Link>
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {formation.description}
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <UserGroupIcon className="h-4 w-4" />
                <span>Par {formation.author.name}</span>
              </div>
            </div>
            <Link
              href={`/formations/${formation.slug}`}
              className="block w-full py-2 bg-primary text-primary-foreground text-center rounded-full hover:bg-primary/90 transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
} 