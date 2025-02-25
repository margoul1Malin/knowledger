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

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <FormationContent formation={formation} />
    </Suspense>
  )
} 