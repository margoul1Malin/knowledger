import Link from 'next/link'
import { HomeIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <ShieldExclamationIcon className="h-20 w-20 text-destructive mx-auto" />
        <h1 className="text-2xl font-semibold text-foreground">Accès refusé</h1>
        <p className="text-muted-foreground">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
        >
          <HomeIcon className="h-5 w-5" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
} 