import { useEffect } from 'react'
import { useAuth } from './useAuth'

export function useHistory(contentId: string, contentType: string) {
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
            contentId,
            contentType
          })
        })
      } catch (error) {
        console.error('Erreur lors de l\'ajout à l\'historique:', error)
      }
    }

    addToHistory()
  }, [contentId, contentType, user])
} 