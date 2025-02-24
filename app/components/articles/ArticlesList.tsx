'use client'

import { motion } from 'framer-motion'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { Article, User } from '@prisma/client'

type ArticleWithAuthor = Article & {
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

export default function ArticlesList({ articles }: { articles: ArticleWithAuthor[] }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {articles.map((article) => (
        <motion.article 
          key={article.id}
          variants={item}
          className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg"
        >
          {article.imageUrl && (
            <div className="aspect-video relative bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <Link href={`/articles/${article.slug}`}>
              <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {article.title}
              </h2>
            </Link>
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {article.content}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Par {article.author.name}
              </span>
              <Link 
                href={`/articles/${article.slug}`}
                className="text-primary hover:text-primary/80"
              >
                <ArrowUpRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </motion.article>
      ))}
    </motion.div>
  )
} 