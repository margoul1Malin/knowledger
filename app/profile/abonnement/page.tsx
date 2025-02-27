'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { UserRole } from '@prisma/client'
import { SparklesIcon, ShieldCheckIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

export default function AbonnementPage() {
  const { data: session } = useSession()

  const renderContent = () => {
    switch (session?.user?.role) {
      case UserRole.ADMIN:
        return (
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShieldCheckIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Administrateur</h2>
                <p className="text-muted-foreground">
                  Vous avez accès à toutes les fonctionnalités de la plateforme
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              En tant qu'administrateur, vous pouvez gérer les utilisateurs, le contenu et les paramètres de la plateforme.
            </p>
          </div>
        )

      case UserRole.FORMATOR:
        return (
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <VideoCameraIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Formateur</h2>
                <p className="text-muted-foreground">
                  Vous pouvez créer et publier du contenu sur la plateforme
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              En tant que formateur, vous pouvez créer des articles, des vidéos et des formations pour partager vos connaissances.
            </p>
          </div>
        )

      case UserRole.PREMIUM:
        return (
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <SparklesIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Premium</h2>
                <p className="text-muted-foreground">
                  Merci de votre confiance !
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Vous avez accès à tout le contenu premium de la plateforme. Profitez de votre expérience d'apprentissage !
            </p>
          </div>
        )

      default:
        return (
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Passez à l'offre Premium
                </h2>
                <p className="text-muted-foreground">
                  Accédez à tout le contenu et profitez de fonctionnalités exclusives.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-primary" />
                    <span>Accès à tout le contenu premium</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-primary" />
                    <span>Téléchargement des ressources</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-primary" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/premium"
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>Devenir Premium</span>
              </Link>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Abonnement</h1>
      {renderContent()}
    </div>
  )
} 