'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import ArticleCard from './ArticleCard'
import { Button } from '@/components/ui/button'

interface Article {
  id: string
  title: string
  content: string
  imageUrl: string
  slug: string
  isPremium: boolean
  createdAt: string
  author: {
    name: string
    image: string | null
  }
}

export default function ArticlesCarousel() {
  const [articles, setArticles] = useState<Article[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const response = await fetch('/api/articles?limit=5')
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des articles:', error)
      }
    }

    fetchLatestArticles()
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <div className="relative w-full max-w-[800px] mx-auto">
      <div className="relative aspect-[16/9]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <ArticleCard article={articles[currentIndex]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute left-0 right-0 bottom-4 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm"
            onClick={prevSlide}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-sm"
            onClick={nextSlide}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {articles.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-primary/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 