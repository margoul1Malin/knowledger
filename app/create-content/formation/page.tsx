'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormationBasicInfo from './FormationBasicInfo'
import FormationVideos from './FormationVideos'
import { useAuth } from '@/app/hooks/useAuth'

type FormationData = {
  title: string
  description: string
  content: string
  imageUrl: string
  categoryId: string
  isPremium: boolean
  price: number | null
}

export default function CreateFormation() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [formationId, setFormationId] = useState<string | null>(null)
  const [formationData, setFormationData] = useState<FormationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleBasicInfoSubmit = async (data: FormationData) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/formations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          authorId: user?.id,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur lors de la création")
      }

      const formation = await res.json()
      setFormationId(formation.id)
      setFormationData(data)
      setStep(2)
    } catch (error: any) {
      console.error(error)
      alert(error.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    router.push("/formations")
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Créer une formation</h1>

        {step === 1 && (
          <FormationBasicInfo
            onSubmit={handleBasicInfoSubmit}
            isLoading={isLoading}
          />
        )}

        {step === 2 && formationId && (
          <FormationVideos
            formationId={formationId}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  )
} 