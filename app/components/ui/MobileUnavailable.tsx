'use client'

import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'

interface MobileUnavailableProps {
  title?: string
  message?: string
}

export default function MobileUnavailable({ 
  title = "Fonctionnalité non disponible sur mobile",
  message = "Cette fonctionnalité du site est indisponible sur téléphone. Veuillez vous connecter sur un ordinateur pour y accéder."
}: MobileUnavailableProps) {
  return (
    <div className="lg:hidden flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[60vh]">
      <DevicePhoneMobileIcon className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        {message}
      </p>
    </div>
  )
} 