'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import PurchaseModal from '@/app/components/PurchaseModal'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import Image from 'next/image'
import VideoPlayer from '@/app/components/VideoPlayer'
import AuthorCard from '@/app/components/ui/AuthorCard'
import StarRating from '@/app/components/formations/StarRating'
import Comments from '@/app/components/Comments'

interface VideoFormation {
  order: number;
  video: {
    id: string;
    title: string;
    videoUrl: string;
    coverImage: string;
    duration?: number;
  }
}

export default function FormationContent({ formation: initialFormation }: { formation: any }) {
  const { user } = useAuth()
  const [formation, setFormation] = useState(initialFormation)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showRatingPrompt, setShowRatingPrompt] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [totalRatings, setTotalRatings] = useState<number | null>(null)
  const { toast } = useToast()

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

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await fetch(`/api/formations/${formation.slug}`)
        const data = await res.json()
        setAverageRating(data.averageRating)
        setTotalRatings(data.totalRatings)
        if (data.userRating) {
          setUserRating(data.userRating)
        }
      } catch (error) {
        console.error('Erreur:', error)
      }
    }

    if (formation.canAccess) {
      fetchRatings()
    }
  }, [formation.slug, formation.canAccess])

  const handleRate = async (rating: number) => {
    try {
      const res = await fetch(`/api/formations/${formation.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setUserRating(rating)
      setAverageRating(data.average)
      setTotalRatings(data.total)
      
      toast({
        title: "Merci !",
        description: "Votre note a bien été prise en compte",
      })
      
      setShowRatingPrompt(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre note",
        variant: "destructive"
      })
    }
  }

  // Afficher l'incitation à noter après 5 minutes de visionnage
  useEffect(() => {
    if (formation.canAccess && !userRating) {
      const timer = setTimeout(() => {
        setShowRatingPrompt(true)
      }, 5 * 60 * 1000)

      return () => clearTimeout(timer)
    }
  }, [formation.canAccess, userRating])

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar avec AuthorCard */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <AuthorCard author={formation.author} />
              
              {/* Composant de notation */}
              {formation.canAccess && (
                <div className="bg-card rounded-lg border border-border p-4">
                  <h3 className="font-semibold mb-4">Noter cette formation</h3>
                  <div className="space-y-2">
                    <StarRating
                      rating={userRating || 0}
                      interactive={true}
                      onRate={handleRate}
                      size="lg"
                    />
                    {averageRating !== null && totalRatings !== null && (
                      <p className="text-sm text-muted-foreground">
                        Note moyenne : {averageRating.toFixed(1)}/5
                        <br />
                        {totalRatings} avis
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-6">
            <div className="aspect-video bg-card rounded-lg overflow-hidden mb-8">
              {currentVideo && (
                <VideoPlayer
                  url={currentVideo.videoUrl}
                  videoId={currentVideo.id}
                  onDurationChange={(duration) => {
                    const updatedVideos = formation.videos.map((vf: VideoFormation) => {
                      if (vf.video.id === currentVideo.id) {
                        return {
                          ...vf,
                          video: { ...vf.video, duration }
                        }
                      }
                      return vf
                    })
                    setFormation((prev: typeof initialFormation) => ({ ...prev, videos: updatedVideos }))
                  }}
                />
              )}
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{formation.title}</h1>
              
              <div className="flex items-center gap-2 text-muted-foreground">
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

              {/* Section commentaires */}
              <div className="mt-12">
                <Comments itemId={formation.id} itemType="formation" />
              </div>
            </div>
          </div>

          {/* Sidebar avec la liste des vidéos */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <h2 className="font-semibold mb-4">Vidéos de la formation</h2>
              <div className="space-y-2">
                {formation.videos
                  .sort((a: VideoFormation, b: VideoFormation) => a.order - b.order)
                  .map((videoFormation: VideoFormation, index: number) => (
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
                        {videoFormation.video.duration ? `${videoFormation.video.duration} min` : 'Durée non disponible'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popup d'incitation à noter */}
          {showRatingPrompt && !userRating && (
            <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm animate-in slide-in-from-bottom">
              <h4 className="font-semibold mb-2">Que pensez-vous de cette formation ?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Votre avis nous aide à améliorer nos contenus
              </p>
              <div className="space-y-4">
                <StarRating
                  interactive={true}
                  onRate={handleRate}
                  size="lg"
                />
                <button
                  onClick={() => setShowRatingPrompt(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Plus tard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 