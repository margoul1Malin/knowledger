import { Suspense } from 'react'
import ArticleContent from './ArticleContent'
import prisma from '@/lib/prisma'

export default async function ArticlePage({
  params: paramsPromise
}: {
  params: { slug: string }
}) {
  const params = await paramsPromise
  
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { 
      author: true
    }
  })

  if (!article) {
    return null
  }

  // Récupérer les statistiques de l'auteur séparément
  const authorWithStats = await prisma.user.findUnique({
    where: { id: article.author.id },
    include: {
      publicProfile: true,
      _count: {
        select: {
          articles: true,
          videos: true,
          formations: true
        }
      }
    }
  })

  // Combiner les données
  const enrichedArticle = {
    ...article,
    author: authorWithStats
  }

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ArticleContent article={enrichedArticle} />
    </Suspense>
  )
} 