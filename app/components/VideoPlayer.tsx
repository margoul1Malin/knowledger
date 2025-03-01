'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

type Props = {
  url: string
  videoId: string
  onDurationChange?: (duration: number) => void
}

export default function VideoPlayer({ url, videoId, onDurationChange }: Props) {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [lastSavedTime, setLastSavedTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const lastUpdateRef = useRef<number>(0)
  const MIN_UPDATE_INTERVAL = 5000 // 5 secondes minimum entre les mises à jour
  const hasSetInitialTime = useRef(false)

  useEffect(() => {
    const fetchLastPosition = async () => {
      if (!session?.user || hasSetInitialTime.current) return

      try {
        // D'abord, vérifier s'il y a un timestamp dans l'URL
        const urlTimestamp = searchParams.get('t')
        if (urlTimestamp) {
          const time = parseFloat(urlTimestamp)
          if (videoRef.current) {
            videoRef.current.currentTime = time
            hasSetInitialTime.current = true
          }
          return
        }

        // Sinon, récupérer depuis l'historique
        const response = await fetch(`/api/history/last-position?itemId=${videoId}&type=video`)
        if (!response.ok) return

        const data = await response.json()
        if (data.timestamp && videoRef.current) {
          videoRef.current.currentTime = data.timestamp
          hasSetInitialTime.current = true
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la dernière position:', error)
      }
    }

    fetchLastPosition()
  }, [session, videoId, searchParams])

  const handleLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoDuration = Math.floor(event.currentTarget.duration / 60) // Convertir en minutes
    console.log('Durée de la vidéo chargée:', videoDuration)
    setDuration(videoDuration)
    onDurationChange?.(videoDuration)

    // Réessayer de définir la position initiale si ce n'est pas encore fait
    if (!hasSetInitialTime.current) {
      const startTime = searchParams.get('t')
      if (startTime) {
        event.currentTarget.currentTime = parseFloat(startTime)
        hasSetInitialTime.current = true
      }
    }
  }

  const handleTimeUpdate = async (event: React.SyntheticEvent<HTMLVideoElement>) => {
    // Vérifier si l'utilisateur est connecté et a un rôle autorisé
    if (!session?.user || session.user.role === 'NORMAL') {
      return // Sortir silencieusement si l'utilisateur est NORMAL
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
      ref={videoRef}
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