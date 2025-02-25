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
    include: { author: true }
  })

  if (!video) {
    return null
  }

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VideoContent video={video} />
    </Suspense>
  )
} 