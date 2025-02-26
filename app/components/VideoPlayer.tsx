'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

type Props = {
  url: string
  videoId: string
  onDurationChange?: (duration: number) => void
}

export default function VideoPlayer({ url, videoId, onDurationChange }: Props) {
  const { data: session } = useSession()
  const [lastSavedTime, setLastSavedTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const lastUpdateRef = useRef<number>(0)
  const MIN_UPDATE_INTERVAL = 5000 // 5 secondes minimum entre les mises à jour

  const handleLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoDuration = Math.floor(event.currentTarget.duration / 60) // Convertir en minutes
    console.log('Durée de la vidéo chargée:', videoDuration)
    setDuration(videoDuration)
    onDurationChange?.(videoDuration)
  }

  const handleTimeUpdate = async (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!session?.user) {
      console.log('Pas de session utilisateur')
      return
    }
    
    const now = Date.now()
    if (now - lastUpdateRef.current < MIN_UPDATE_INTERVAL) {
      console.log('Mise à jour trop rapide, on attend')
      return
    }
    
    const currentTime = event.currentTarget.currentTime
    if (Math.abs(currentTime - lastSavedTime) < 5) {
      console.log('Pas assez de progression pour sauvegarder')
      return
    }

    try {
      console.log('Tentative de sauvegarde:', {
        type: 'video',
        itemId: videoId,
        timestamp: currentTime,
        duration: duration
      })

      lastUpdateRef.current = now
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'video',
          itemId: videoId,
          timestamp: currentTime,
          duration: duration
        })
      })

      console.log('Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      let data
      const responseText = await response.text()
      console.log('Réponse brute:', responseText)
      
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Erreur parsing JSON:', e)
        throw new Error('Réponse invalide du serveur')
      }

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}`)
      }

      if (data.success) {
        console.log('Sauvegarde réussie:', data)
        setLastSavedTime(currentTime)
      } else {
        console.error('Erreur dans la réponse:', data.error)
      }
    } catch (error) {
      console.error('Erreur complète:', error)
      console.error('Erreur lors de la sauvegarde de la progression:', 
        error instanceof Error ? error.message : 'Erreur inconnue'
      )
    }
  }

  return (
    <video
      src={url}
      controls
      className="w-full h-full"
      controlsList="nodownload"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
    >
      Votre navigateur ne supporte pas la lecture de vidéos.
    </video>
  )
} 