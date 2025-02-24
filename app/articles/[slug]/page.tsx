import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Image from 'next/image'

export default async function ArticlePage({
  params
}: {
  params: { slug: string }
}) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { author: true }
  })

  if (!article) {
    notFound()
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
          {article.content}
        </div>
      </article>
    </div>
  )
} 