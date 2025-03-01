'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'

interface TwoFactorSettingsProps {
  user: {
    twoFactorEnabled: boolean
    twoFactorMethod?: string
    phoneNumber?: string
  }
}

export default function TwoFactorSettings({ user }: TwoFactorSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [method, setMethod] = useState<'EMAIL' | 'PHONE'>(
    user.twoFactorMethod as 'EMAIL' | 'PHONE' || 'EMAIL'
  )
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSetup = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          phoneNumber: method === 'PHONE' ? phoneNumber : undefined
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      setShowVerification(true)
      toast({
        title: 'Code envoyé',
        description: `Un code de vérification a été envoyé par ${
          method === 'EMAIL' ? 'email' : 'SMS'
        }.`
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast({
        title: 'Succès',
        description: 'La double authentification a été activée avec succès.'
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Double Authentification (2FA)</h3>
        <p className="text-sm text-muted-foreground">
          Ajoutez une couche de sécurité supplémentaire à votre compte.
        </p>
      </div>

      {!user.twoFactorEnabled ? (
        <div className="space-y-4">
          <RadioGroup
            value={method}
            onValueChange={(value) => setMethod(value as 'EMAIL' | 'PHONE')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="EMAIL" id="email" />
              <Label htmlFor="email">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PHONE" id="phone" />
              <Label htmlFor="phone">SMS</Label>
            </div>
          </RadioGroup>

          {method === 'PHONE' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+33612345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}

          {!showVerification ? (
            <Button onClick={handleSetup} disabled={isLoading}>
              {isLoading ? 'Configuration...' : 'Configurer la 2FA'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code de vérification</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button onClick={handleVerify} disabled={isLoading}>
                {isLoading ? 'Vérification...' : 'Vérifier'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-green-500">●</span>
            <span>
              2FA activée via {user.twoFactorMethod === 'EMAIL' ? 'email' : 'SMS'}
            </span>
          </div>
          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => {
              // Ajouter la logique de désactivation ici
            }}
          >
            Désactiver la 2FA
          </Button>
        </div>
      )}
    </div>
  )
} 