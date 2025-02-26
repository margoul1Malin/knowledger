'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import PurchaseModal from '@/app/components/PurchaseModal'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import VideoPlayer from '@/app/components/VideoPlayer'

export default function VideoContent({ video: initialVideo }: { video: any }) {
  const { user } = useAuth()
  const [video, setVideo] = useState(initialVideo)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/videos/${video.slug}/check-access`)
        const data = await res.json()
        setVideo(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [video.slug])

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!video.canAccess) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
          <p className="text-muted-foreground">
            Cette vidéo est premium. Veuillez l'acheter ou devenir premium pour y accéder.
          </p>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Accéder au contenu
          </button>
        </div>
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          item={video}
          type="video"
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="relative w-full rounded-2xl overflow-hidden mb-8" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0">
            <VideoPlayer
              url={video.videoUrl}
              videoId={video.id}
              onDurationChange={(duration) => {
                setVideo((prev: typeof initialVideo) => ({
                  ...prev,
                  duration
                }))
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">
            {video.title}
          </h1>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Par {video.author.name}</span>
            <span>•</span>
            <time>{new Date(video.createdAt).toLocaleDateString()}</time>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mt-8">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {video.description}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
} 