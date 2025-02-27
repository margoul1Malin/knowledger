'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Article } from '@prisma/client'
import { motion } from 'framer-motion'

type ArticleWithAuthor = Article & {
  author: {
    name: string
    image: string | null
  }
}

export default function ArticleCard({ article }: { article: ArticleWithAuthor }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
    >
      <Link href={`/articles/${article.slug}`}>
        <div className="relative aspect-video">
          <Image
            src={article.imageUrl || '/placeholder-article.jpg'}
            alt={article.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
            <span>•</span>
            <span>{article.author.name}</span>
          </div>
          {article.isPremium && (
            <div className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-sm">
              Premium
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
