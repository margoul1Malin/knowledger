import { Suspense } from 'react'
import FormationContent from './FormationContent'
import prisma from '@/lib/prisma'

export default async function FormationPage({
  params
}: {
  params: { slug: string }
}) {
  const formation = await prisma.formation.findUnique({
    where: { slug: params.slug },
    include: { 
      author: {
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
      },
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

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <FormationContent formation={formation} />
    </Suspense>
  )
} 