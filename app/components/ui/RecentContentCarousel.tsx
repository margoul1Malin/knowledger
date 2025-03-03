'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ContentCard from './ContentCard'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface Content {
  id: string
  type: 'article' | 'video' | 'formation'
  title: string
  description: string
  imageUrl: string
  slug: string
  createdAt: Date
}

export default function RecentContentCarousel() {
  const [contents, setContents] = useState<Content[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 3

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await fetch('/api/recent-content')
        if (!res.ok) throw new Error('Erreur lors du chargement')
        const data = await res.json()
        setContents(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContents()
  }, [])

  // Défilement automatique
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => 
        prev === Math.ceil(contents.length / itemsPerPage) - 1 ? 0 : prev + 1
      )
    }, 5000) // Change toutes les 5 secondes

    return () => clearInterval(timer)
  }, [contents.length])

  const nextPage = () => {
    setCurrentPage((prev) => 
      prev === Math.ceil(contents.length / itemsPerPage) - 1 ? 0 : prev + 1
    )
  }

  const prevPage = () => {
    setCurrentPage((prev) => 
      prev === 0 ? Math.ceil(contents.length / itemsPerPage) - 1 : prev - 1
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const currentItems = contents.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  return (
    <div className="relative w-full">
      <div className="overflow-hidden px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentItems.map((content) => (
              <ContentCard
                key={content.id}
                type={content.type}
                title={content.title}
                description={content.description}
                image={content.imageUrl}
                href={`/${content.type}s/${content.slug}`}
                createdAt={content.createdAt}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <button
        onClick={prevPage}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full md:-translate-x-12 bg-background/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-background hover:scale-110 transition-all"
      >
        <ChevronLeftIcon className="h-6 w-6 text-primary" />
      </button>

      <button
        onClick={nextPage}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full md:translate-x-12 bg-background/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-background hover:scale-110 transition-all"
      >
        <ChevronRightIcon className="h-6 w-6 text-primary" />
      </button>

      {/* Indicateurs de page */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(contents.length / itemsPerPage) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentPage ? 'bg-primary w-4' : 'bg-primary/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
} 