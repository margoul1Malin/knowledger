'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const hasAcceptedCookies = localStorage.getItem('cookiesAccepted')
    if (!hasAcceptedCookies) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:p-6 z-50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4 text-sm text-muted-foreground">
            <div className="bg-primary/10 p-2 rounded-full">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <p>
              Nous utilisons des cookies essentiels pour assurer le bon fonctionnement du site. 
              Ces cookies sont nécessaires à la navigation et ne peuvent pas être désactivés.
              En continuant votre navigation, vous acceptez l'utilisation de ces cookies.
            </p>
          </div>
          <Button 
            onClick={acceptCookies}
            className="whitespace-nowrap"
          >
            Accepter et fermer
          </Button>
        </div>
      </div>
    </div>
  )
} 