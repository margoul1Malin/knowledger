import VideosList from '@/app/components/videos/VideosList'
import prisma from '@/lib/prisma'

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    where: {
      formations: {
        none: {} // Sélectionner uniquement les vidéos qui ne sont pas dans des formations
      }
    },
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
            Vidéos
          </h1>
          <p className="text-muted-foreground">
            Apprenez visuellement avec nos vidéos de qualité
          </p>
        </div>

        <VideosList videos={videos} />
      </div>
    </div>
  )
} 