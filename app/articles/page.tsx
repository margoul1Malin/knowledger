import prisma from '@/lib/prisma'
import ArticlesList from '@/app/components/articles/ArticlesList'

export default async function Articles() {
  const articles = await prisma.article.findMany({
    include: {
      author: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Articles
          </h1>
          <p className="text-muted-foreground">
            Découvrez nos derniers articles rédigés par des experts
          </p>
        </div>

        <ArticlesList articles={articles} />
      </div>
    </div>
  )
} 