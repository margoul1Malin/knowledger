'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Article, Video, Formation } from '@prisma/client'
import ArticleCard from '@/app/components/articles/ArticleCard'
import VideoCard from '@/app/components/videos/VideoCard'
import FormationCard from '@/app/components/formations/FormationCard'

type Author = {
  name: string
  image: string | null
}

type ArticleWithAuthor = Article & {
  author: Author
}

type VideoWithAuthor = Video & {
  author: Author
}

type FormationWithAuthor = Formation & {
  author: Author
}

type ProfileWithContent = User & {
  articles: ArticleWithAuthor[]
  videos: VideoWithAuthor[]
  formations: FormationWithAuthor[]
}

const tabs = [
  { id: 'articles', label: 'Articles' },
  { id: 'videos', label: 'Vidéos' },
  { id: 'formations', label: 'Formations' }
]

export default function ContentTabs({ profile }: { profile: ProfileWithContent }) {
  const [activeTab, setActiveTab] = useState('articles')

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-card border border-border rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'articles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              {profile.articles.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Aucun article publié
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
              {profile.videos.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Aucune vidéo publiée
                </div>
              )}
            </div>
          )}

          {activeTab === 'formations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.formations.map((formation) => (
                <FormationCard key={formation.id} formation={formation} />
              ))}
              {profile.formations.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Aucune formation publiée
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
