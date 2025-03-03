'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useAuth } from '@/app/hooks/useAuth'
import PurchaseModal from '@/app/components/PurchaseModal'
import AuthorCard from '@/app/components/ui/AuthorCard'
import Comments from '@/app/components/Comments'

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

        // Récupérer les statistiques de l'auteur
        const authorRes = await fetch(`/api/users/${article.author.id}/stats`)
        const authorStats = await authorRes.json()

        setArticle({
          ...data,
          author: {
            ...data.author,
            _count: authorStats._count
          }
        })
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [article.slug, article.author.id])

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
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar avec AuthorCard */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AuthorCard author={article.author} />
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <article className="max-w-4xl">
              <div className="space-y-4 mb-8">
                <h1 className="text-4xl font-bold text-foreground">
                  {article.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <time>{new Date(article.createdAt).toLocaleDateString()}</time>
                  {article.isPremium && (
                    <>
                      <span>•</span>
                      <span className="text-primary">{article.price}€</span>
                    </>
                  )}
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

              {/* Section commentaires */}
              <div className="mt-12">
                <Comments itemId={article.id} itemType="article" />
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
} 