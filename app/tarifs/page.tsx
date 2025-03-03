'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { CheckIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function TarifsPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session')
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error('Stripe not initialized')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-24">
      {/* Section Premium */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10" />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Tarifs et Abonnements
            </h1>
            <p className="text-lg text-muted-foreground">
              Accédez à du contenu premium et développez vos compétences avec nos différentes options d'abonnement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Abonnement Mensuel */}
            <div className="relative rounded-2xl border border-border bg-card p-8 shadow-lg">
              <div className="absolute -top-4 left-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1">
                <SparklesIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Mensuel</span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">24.99€</span>
                  <span className="text-muted-foreground ml-2">/mois</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Accès à tout le contenu premium</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Historique de visionnage</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleSubscribe('monthly')}
                  disabled={isLoading || !session?.user}
                  className="mt-8 block w-full rounded-lg bg-primary px-6 py-3 text-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Chargement...' : 'Commencer maintenant'}
                </button>
                {!session?.user && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Connectez-vous pour souscrire
                  </p>
                )}
              </div>
            </div>

            {/* Abonnement Annuel */}
            <div className="relative rounded-2xl border border-primary bg-card p-8 shadow-lg">
              <div className="absolute -top-4 left-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1">
                <SparklesIcon className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">Annuel</span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">249.99€</span>
                  <span className="text-muted-foreground ml-2">/an</span>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-500">
                    Économisez 50€
                  </span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Tous les avantages du plan mensuel</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>2 mois gratuits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <span>Prix bloqué pendant 1 an</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleSubscribe('yearly')}
                  disabled={isLoading || !session?.user}
                  className="mt-8 block w-full rounded-lg bg-primary px-6 py-3 text-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Chargement...' : 'Choisir l\'offre annuelle'}
                </button>
                {!session?.user && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Connectez-vous pour souscrire
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-muted-foreground">
            <p className="text-sm">
              Le prix des articles individuels est fixé par leurs créateurs respectifs.
            </p>
          </div>
        </div>
      </section>

      {/* Section Formateurs */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <UserGroupIcon className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Pour les Formateurs</h2>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-6">
                  Conditions de publication
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <CheckIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Liberté de tarification</h4>
                      <p className="text-muted-foreground">
                        Vous êtes libre de fixer vos propres tarifs pour vos contenus. Une commission de 15% est appliquée sur les ventes réalisées via notre plateforme.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <CheckIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Non-exclusivité</h4>
                      <p className="text-muted-foreground">
                        Vous pouvez publier vos contenus sur d'autres plateformes. Nous ne demandons pas d'exclusivité.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <CheckIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Qualité du contenu</h4>
                      <p className="text-muted-foreground">
                        L'administrateur se réserve le droit de supprimer tout contenu jugé préjudiciable à la réputation de la plateforme.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <Link
                    href="/formatorquery"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-6 py-3 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <UserGroupIcon className="h-5 w-5" />
                    Devenir formateur
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 