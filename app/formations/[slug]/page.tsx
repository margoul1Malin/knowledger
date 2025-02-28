import { Suspense } from 'react'
import FormationContent from './FormationContent'
import prisma from '@/lib/prisma'

export default async function FormationPage({
  params: paramsPromise
}: {
  params: { slug: string }
}) {
  const params = await paramsPromise
  
  const formation = await prisma.formation.findUnique({
    where: { slug: params.slug },
    include: { 
      author: true,
      videos: {
        include: {
          video: {
            include: {
              author: true
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  })

  if (!formation) {
    return null
  }

  // Récupérer les statistiques de l'auteur séparément
  const authorWithStats = await prisma.user.findUnique({
    where: { id: formation.author.id },
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
  const enrichedFormation = {
    ...formation,
    author: authorWithStats
  }

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <FormationContent formation={enrichedFormation} />
    </Suspense>
  )
} 