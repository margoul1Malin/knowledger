'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'

type PurchaseModalProps = {
  isOpen: boolean
  onClose: () => void
  item: any
  type: 'article' | 'video' | 'formation'
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PurchaseModal({ isOpen, onClose, item, type }: PurchaseModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/create-purchase-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          itemId: item.id
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
      // Gérer l'erreur (toast, message, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  if (!item) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold">
                    Contenu Premium
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-2">
                  <p className="text-muted-foreground mb-4">
                    Ce {type} est disponible en achat unique ou avec l'abonnement Premium.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Achat unique</h4>
                        <span className="text-primary font-semibold">{item.price}€</span>
                      </div>
                      <button
                        onClick={handlePurchase}
                        disabled={isLoading}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Chargement...' : 'Acheter'}
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Abonnement Premium</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Accédez à tout le contenu premium à partir de 24.99€/mois
                      </p>
                      <Link
                        href="/premium"
                        className="block w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
                      >
                        Voir les offres
                      </Link>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 