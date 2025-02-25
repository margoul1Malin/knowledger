'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import PurchaseModal from '@/app/components/PurchaseModal'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import Image from 'next/image'
import { LockClosedIcon } from '@heroicons/react/24/outline'

export default function FormationContent({ formation: initialFormation }: { formation: any }) {
  const { user } = useAuth()
  const [formation, setFormation] = useState(initialFormation)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/formations/${formation.slug}/check-access`)
        const data = await res.json()
        setFormation(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [formation.slug])

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!formation.canAccess) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">{formation.title}</h1>
          <p className="text-muted-foreground">
            Cette formation est premium. Veuillez l'acheter ou devenir premium pour y accéder.
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
          item={formation}
          type="formation"
        />
      </>
    )
  }

  const currentVideo = formation.videos[currentVideoIndex]?.video

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vidéo principale et informations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lecteur vidéo */}
            <div className="aspect-video bg-card rounded-lg overflow-hidden">
              <video
                src={currentVideo?.videoUrl}
                controls
                poster={currentVideo?.coverImage}
                className="w-full h-full object-contain bg-black"
              >
                <source src={currentVideo?.videoUrl} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>

            {/* Informations de la formation */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{formation.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Par {formation.author.name}</span>
                <span>•</span>
                <time>{new Date(formation.createdAt).toLocaleDateString()}</time>
                {formation.isPremium && (
                  <>
                    <span>•</span>
                    <span className="text-primary">{formation.price}€</span>
                  </>
                )}
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {formation.description}
                </ReactMarkdown>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {formation.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Sidebar avec la liste des vidéos */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <h2 className="font-semibold mb-4">Vidéos de la formation</h2>
              <div className="space-y-2">
                {formation.videos.map((videoFormation: any, index: number) => (
                  <button
                    key={videoFormation.video.id}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-full flex items-start gap-3 p-2 rounded-lg hover:bg-muted text-left
                      ${currentVideoIndex === index ? 'bg-muted' : ''}`}
                  >
                    <div className="relative w-24 aspect-video bg-muted rounded overflow-hidden">
                      <Image
                        src={videoFormation.video.coverImage}
                        alt={videoFormation.video.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {videoFormation.video.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {videoFormation.video.duration} min
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 