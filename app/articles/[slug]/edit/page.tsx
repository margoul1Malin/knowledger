import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import ArticleForm from '@/app/components/articles/ArticleForm'

export default async function EditArticlePage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const { slug } = await params

  if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
    redirect('/')
  }

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true
    }
  })

  if (!article) {
    redirect('/profile/contenu')
  }

  // Vérifier que l'utilisateur est l'auteur ou admin
  if (article.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/profile/contenu')
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Modifier l'article</h1>
          <ArticleForm initialData={article} isEditing />
        </div>
      </div>
    </div>
  )
} 