'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type PlanType = 'monthly' | 'yearly'

export default function PremiumPage() {
  const { data: session } = useSession()
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plans = {
    monthly: {
      id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY,
      price: '24.99',
      name: 'Mensuel'
    },
    yearly: {
      id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY,
      price: '249.99',
      name: 'Annuel',
      savings: '50€ d\'économie'
    }
  }

  const features = {
    premium: [
      'Accès à tout le contenu premium',
      'Téléchargement des vidéos',
      'Support prioritaire',
      'Accès aux formations exclusives',
      'Certificats de complétion'
    ],
    free: [
      'Contenu gratuit limité',
      'Pas de téléchargement',
      'Support standard',
      'Pas d\'historique' 
    ]
  }

  const handleSubscribe = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan
        })
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
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">
              Passez à la vitesse supérieure avec Premium
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Débloquez l'accès à tout notre contenu premium et développez vos compétences sans limites
            </p>
          </motion.div>
        </div>

        {/* Comparaison des plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Plan Gratuit */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4">Plan Gratuit</h2>
            <ul className="space-y-4 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <XCircleIcon className="h-6 w-6 text-destructive flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <p className="text-2xl font-bold">Gratuit</p>
          </div>

          {/* Plan Premium */}
          <div className="bg-primary/5 border border-primary rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <SparklesIcon className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Plan Premium</h2>
            <ul className="space-y-4 mb-8">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Sélection du plan */}
            <div className="bg-card rounded-lg p-2 mb-6">
              <div className="grid grid-cols-2 gap-2">
                {(['monthly', 'yearly'] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3 rounded-md text-sm font-medium transition-colors
                      ${selectedPlan === plan 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                      }`}
                  >
                    {plans[plan].name}
                    <div className="text-xs opacity-80">
                      {plan === 'yearly' && plans[plan].savings}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold">
                {plans[selectedPlan].price}€
                <span className="text-lg font-normal text-muted-foreground">
                  /{selectedPlan === 'monthly' ? 'mois' : 'an'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isLoading || !session?.user}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium
                hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Chargement...' : 'Devenir Premium'}
            </button>
            {!session?.user && (
              <p className="text-sm text-muted-foreground mt-2">
                Connectez-vous pour souscrire
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 