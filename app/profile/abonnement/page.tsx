'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

interface Subscription {
  endDate: string
  isActive: boolean
  plan: string
  cancelledAt?: string | null
}

interface SubscriptionData {
  role: 'USER' | 'ADMIN' | 'FORMATOR'
  hasPremiumAccess: boolean
  subscription: Subscription | null
}

export default function AbonnementPage() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription')
      if (!res.ok) throw new Error('Erreur lors de la récupération')
      
      const data = await res.json()
      setSubscriptionData(data)
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les informations de l\'abonnement.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST'
      })

      if (!res.ok) throw new Error('Erreur lors de la résiliation')

      const data = await res.json()
      toast({
        title: 'Abonnement résilié',
        description: 'Votre abonnement sera actif jusqu\'à la fin de la période en cours.',
      })
      
      fetchSubscription()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de résilier l\'abonnement.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenew = () => {
    router.push('/premium')
  }

  const renderAdminFormatorInfo = () => {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Accès Premium Permanent</CardTitle>
              <CardDescription>
                En tant que {subscriptionData?.role === 'ADMIN' ? 'administrateur' : 'formateur'}, 
                vous avez accès à tout le contenu premium
              </CardDescription>
            </div>
            <Badge variant="success">Actif</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Vous avez accès à :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Tous les articles premium</li>
              <li>Toutes les vidéos premium</li>
              <li>Toutes les formations complètes</li>
              <li>Support prioritaire</li>
              {subscriptionData?.role === 'ADMIN' && (
                <li>Fonctionnalités d'administration</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSubscriptionInfo = () => {
    const subscription = subscriptionData?.subscription
    if (!subscription) return null

    const planLabel = subscription.plan === 'YEARLY' 
      ? 'annuel' 
      : subscription.plan === 'MONTHLY'
      ? 'mensuel'
      : 'journalier'

    const endDate = subscription.endDate 
      ? new Date(subscription.endDate).toLocaleDateString('fr-FR')
      : 'Non disponible'

    const isCancelled = subscription.cancelledAt !== null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Votre abonnement Premium {planLabel}</CardTitle>
          <CardDescription>
            Gérez votre abonnement et accédez à tous les avantages premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant={subscription.isActive ? 'success' : 'destructive'}>
                {subscription.isActive ? 'Actif' : 'Inactif'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {subscription.isActive 
                  ? 'Votre abonnement est actif' 
                  : 'Votre abonnement n\'est plus actif'}
              </span>
            </div>
            
            {isCancelled && (
              <>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <span>Date de fin : {endDate}</span>
                </div>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Votre abonnement a été résilié mais reste actif jusqu'à la fin de la période payée.
                    Vous pouvez renouveler votre abonnement à tout moment pour continuer à profiter
                    des avantages premium.
                  </p>
                </div>
              </>
            )}

            <div className="mt-4">
              <h3 className="font-medium mb-2">Détails du plan</h3>
              <div className="text-sm text-muted-foreground">
                <p>Type : Premium {planLabel}</p>
                <p>Prix : {subscription.plan === 'YEARLY' 
                  ? '249.99€/an' 
                  : subscription.plan === 'MONTHLY'
                  ? '24.99€/mois'
                  : '2.99€/jour'
                }</p>
                <p>Prochaine facturation : {endDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isCancelled ? (
            <Button 
              onClick={handleRenew}
              className="w-full"
            >
              Renouveler l&apos;abonnement
            </Button>
          ) : (
            <Button 
              onClick={handleCancel}
              variant="destructive"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Résiliation en cours...' : 'Résilier'}
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  const renderNoSubscription = () => {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Aucun abonnement</CardTitle>
          <CardDescription>
            Vous n'avez pas encore souscrit à un abonnement premium. Découvrez nos offres pour accéder à tout le contenu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>En devenant premium, vous aurez accès à :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Tous les articles premium</li>
              <li>Toutes les vidéos premium</li>
              <li>Toutes les formations complètes</li>
              <li>Support prioritaire</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleRenew} 
            className="w-full"
          >
            Voir les offres Premium
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const renderContent = () => {
    if (!subscriptionData) return null

    if (subscriptionData.role === 'ADMIN' || subscriptionData.role === 'FORMATOR') {
      return renderAdminFormatorInfo()
    }

    if (!subscriptionData.subscription) {
      return renderNoSubscription()
    }

    return renderSubscriptionInfo()
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Gestion de l'abonnement</h1>
            <p className="text-muted-foreground mt-2">
              Gérez votre abonnement et accédez à vos informations de facturation
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  )
} 