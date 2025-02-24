'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import VideoPlayer from '@/app/components/VideoPlayer'
import { LockClosedIcon } from '@heroicons/react/24/outline'

type VideoFormationType = {
  id: string
  order: number
  coverImage: string
  video: {
    id: string
    title: string
    description: string
    videoUrl: string
  }
}

type FormationType = {
  id: string
  title: string
  description: string
  content: string
  isPremium: boolean
  price: number | null
  imageUrl: string
  author: {
    name: string
  }
  category: {
    name: string
  }
  videos: VideoFormationType[]
}

type Props = {
  formation: FormationType
  session: Session | null
}

export default function FormationContent({ formation, session }: Props) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const currentVideo = formation.videos[currentVideoIndex]?.video

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vidéo principale et informations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lecteur vidéo */}
            <div className="aspect-video bg-card rounded-lg overflow-hidden">
              {formation.isPremium && !session?.user ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-card text-card-foreground">
                  <LockClosedIcon className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Contenu Premium</h3>
                  <p className="text-muted-foreground mb-4">
                    Inscrivez-vous pour accéder à cette formation
                  </p>
                  <a
                    href="/auth/signin"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    S'inscrire
                  </a>
                </div>
              ) : (
                currentVideo && <VideoPlayer url={currentVideo.videoUrl} />
              )}
            </div>

            {/* Informations de la formation */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{formation.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Par {formation.author.name}</span>
                <span>•</span>
                <span>{formation.category.name}</span>
                {formation.isPremium && (
                  <>
                    <span>•</span>
                    <span className="text-primary">{formation.price}€</span>
                  </>
                )}
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p>{formation.description}</p>
                
                <h2 className="text-xl font-semibold mt-8 mb-2">Contenu détaillé</h2>
                <div className="whitespace-pre-wrap">{formation.content}</div>
              </div>
            </div>
          </div>

          {/* Sidebar avec la liste des vidéos */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <h2 className="font-semibold mb-4">Vidéos de la formation</h2>
              <div className="space-y-2">
                {formation.videos.map((videoFormation, index) => (
                  <button
                    key={videoFormation.id}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-full flex items-start gap-3 p-2 rounded-lg hover:bg-muted text-left
                      ${currentVideoIndex === index ? 'bg-muted' : ''}`}
                  >
                    {/* Miniature de la vidéo */}
                    <div className="relative w-24 aspect-video bg-muted rounded overflow-hidden">
                      <img
                        src={videoFormation.coverImage || formation.imageUrl}
                        alt={videoFormation.video.title}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Informations de la vidéo */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{videoFormation.video.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {videoFormation.video.description}
                      </p>
                    </div>

                    {/* Indicateur Premium */}
                    {formation.isPremium && !session?.user && (
                      <LockClosedIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
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