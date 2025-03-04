import { useEffect } from 'react'
import { useAuth } from './useAuth'

interface UseHistoryProps {
  contentId: string
  contentType: string
  formationId?: string
  timestamp?: number
}

export function useHistory({ contentId, contentType, formationId, timestamp = 0 }: UseHistoryProps) {
  const { user } = useAuth()

  useEffect(() => {
    // Ne pas enregistrer l'historique pour les utilisateurs non autorisés
    if (!user || !['PREMIUM', 'ADMIN', 'FORMATOR'].includes(user.role)) {
      return
    }

    const addToHistory = async () => {
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            itemId: contentId,
            type: contentType,
            formationId,
            timestamp
          })
        })
      } catch (error) {
        console.error('Erreur lors de l\'ajout à l\'historique:', error)
      }
    }

    addToHistory()
  }, [contentId, contentType, formationId, timestamp, user])
} 