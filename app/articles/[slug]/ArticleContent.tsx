'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useAuth } from '@/app/hooks/useAuth'
import PurchaseModal from '@/app/components/PurchaseModal'

export default function ArticleContent({ article: initialArticle }: { article: any }) {
  const { user } = useAuth()
  const [article, setArticle] = useState(initialArticle)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/articles/${article.slug}`)
        const data = await res.json()
        setArticle(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [article.slug])

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!article.canAccess) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
          <p className="text-muted-foreground">
            Cet article est premium. Veuillez l'acheter ou devenir premium pour y accéder.
          </p>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Accéder au contenu
          </button>
        </div>
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          item={article}
          type="article"
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <article className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-4 text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Par {article.author.name}</span>
            <span>•</span>
            <time>{new Date(article.createdAt).toLocaleDateString()}</time>
          </div>
        </div>

        {article.imageUrl && (
          <div className="relative aspect-video mb-8 rounded-2xl overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  )
} 