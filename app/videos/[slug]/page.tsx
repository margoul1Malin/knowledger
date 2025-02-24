import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'

export default async function VideoPage({
  params
}: {
  params: { slug: string }
}) {
  const video = await prisma.video.findUnique({
    where: {
      slug: params.slug
    },
    include: {
      author: true,
      category: true,
      formations: {
        include: {
          formation: true
        }
      }
    }
  })

  if (!video) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="relative w-full rounded-2xl overflow-hidden mb-8" style={{ paddingTop: '56.25%' }}>
          <video
            src={video.videoUrl}
            title={video.title}
            controls
            className="absolute inset-0 w-full h-full object-contain bg-black"
            poster={video.coverImage}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold text-foreground">
              {video.title}
            </h1>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Par {video.author.name}</span>
              <span>•</span>
              <time>{new Date(video.createdAt).toLocaleDateString()}</time>
            </div>

            <p className="text-muted-foreground">
              {video.description}
            </p>
          </div>

          <div className="space-y-6">
            {video.formation && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Cette vidéo fait partie de :</h2>
                <Link 
                  href={`/formations/${video.formation.slug}`}
                  className="group block"
                >
                  <Image
                    src={video.formation.imageUrl}
                    alt={video.formation.title}
                    width={300}
                    height={169}
                    className="rounded-lg mb-4"
                  />
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {video.formation.title}
                  </h3>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 