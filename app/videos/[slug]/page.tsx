import { Suspense } from 'react'
import VideoContent from './VideoContent'
import prisma from '@/lib/prisma'

export default async function VideoPage({
  params: paramsPromise
}: {
  params: { slug: string }
}) {
  const params = await paramsPromise
  
  const video = await prisma.video.findUnique({
    where: { slug: params.slug },
    include: { 
      author: true
    }
  })

  if (!video) {
    return null
  }

  // Récupérer les statistiques de l'auteur séparément
  const authorWithStats = await prisma.user.findUnique({
    where: { id: video.author.id },
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
  const enrichedVideo = {
    ...video,
    author: authorWithStats
  }

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VideoContent video={enrichedVideo} />
    </Suspense>
  )
} 