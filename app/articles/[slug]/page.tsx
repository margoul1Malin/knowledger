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
    include: { author: true }
  })

  if (!article) {
    return null
  }

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ArticleContent article={article} />
    </Suspense>
  )
} 