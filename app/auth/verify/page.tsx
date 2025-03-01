'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const encodedPassword = searchParams.get('p')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !code || !encodedPassword) return

    setIsLoading(true)
    try {
      // Vérifier le code
      const res = await fetch('/api/auth/2fa/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de vérification')
      }

      // Décoder le mot de passe
      const password = Buffer.from(encodedPassword, 'base64').toString()

      // Si le code est valide, connecter l'utilisateur
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
        twoFactorCode: code
      })

      if (signInResult?.error) {
        throw new Error(signInResult.error)
      }

      toast.success('Connexion réussie')
      router.push('/')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email || !encodedPassword) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          password: Buffer.from(encodedPassword, 'base64').toString()
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success('Nouveau code envoyé')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi du code')
    } finally {
      setIsLoading(false)
    }
  }

  if (!email || !encodedPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Paramètres manquants</h1>
          <p className="text-muted-foreground mb-4">
            Les informations nécessaires sont manquantes.
          </p>
          <Button onClick={() => router.push('/login')}>
            Retour à la connexion
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Vérification en deux étapes</h1>
          <p className="text-muted-foreground">
            Entrez le code envoyé à {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Code à 6 chiffres"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={handleResendCode}
            disabled={isLoading}
            className="text-sm text-primary hover:underline"
          >
            Renvoyer le code
          </button>
        </div>
      </div>
    </div>
  )
} 