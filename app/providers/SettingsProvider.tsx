'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Cookies from 'js-cookie'

export default function SettingsProvider() {
  const { data: session } = useSession()

  useEffect(() => {
    const initializeSettings = async () => {
      if (session?.user?.role === 'ADMIN') {
        try {
          const response = await fetch('/api/admin/settings')
          const settings = await response.json()

          // Mettre à jour les cookies côté client
          Cookies.set('maintenanceMode', settings.maintenanceMode.toString(), {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          })
          Cookies.set('registrationsClosed', settings.registrationsClosed.toString(), {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          })
        } catch (error) {
          console.error('Erreur lors de l\'initialisation des paramètres:', error)
        }
      }
    }

    initializeSettings()
  }, [session])

  return null
} 