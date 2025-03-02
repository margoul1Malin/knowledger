import { NoSymbolIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RegistrationClosedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-destructive/10 rounded-full" />
          </div>
          <NoSymbolIcon className="w-24 h-24 mx-auto text-destructive relative" />
        </div>

        <h1 className="text-4xl font-bold mt-8">
          Inscriptions temporairement fermées
        </h1>
        
        <p className="text-xl text-muted-foreground">
          Les inscriptions sont actuellement suspendues. 
          Merci de réessayer ultérieurement.
        </p>

        <div className="pt-8">
          <Button asChild variant="outline">
            <Link href="/">
              Retourner à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 