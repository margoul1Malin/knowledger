import Link from 'next/link'
import { HomeIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Page non trouvée</h2>
        <p className="text-muted-foreground">
          Désolé, la page que vous recherchez n'existe pas.
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