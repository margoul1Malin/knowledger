'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { Article, User } from '@prisma/client'
import { useAuth } from '@/app/hooks/useAuth'
import PurchaseModal from '@/app/components/PurchaseModal'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Pagination from '@/app/components/ui/Pagination'

type ArticleWithAuthor = Article & {
  author: User
}

interface ArticlesListProps {
  initialArticles: ArticleWithAuthor[]
  totalPages: number
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

export default function ArticlesList({ initialArticles, totalPages }: ArticlesListProps) {
  const { user } = useAuth()
  const [articles] = useState<ArticleWithAuthor[]>(initialArticles)
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithAuthor | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get('page') || '1')

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleArticleClick = (article: ArticleWithAuthor) => {
    if (!article.isPremium || ['PREMIUM', 'ADMIN', 'FORMATOR'].includes(user?.role || '')) {
      router.push(`/articles/${article.slug}`)
      return
    }
    
    setSelectedArticle(article)
    setShowPurchaseModal(true)
  }

  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {articles.map((article) => (
          <motion.article
            key={article.id}
            variants={item}
            className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg cursor-pointer"
            onClick={() => handleArticleClick(article)}
          >
            {article.imageUrl && (
              <div className="aspect-video relative bg-muted">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                {article.isPremium && (
                  <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm font-medium">
                    {article.price}€
                  </div>
                )}
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {article.content}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Par {article.author.name}
                </span>
                <ArrowUpRightIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>

      {selectedArticle && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false)
            setSelectedArticle(null)
          }}
          item={selectedArticle}
          type="article"
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  )
} 