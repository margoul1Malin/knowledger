"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormationBasicInfo from './FormationBasicInfo'
import FormationVideos from './FormationVideos'

interface FormationFormProps {
  initialData?: any
  isEditing?: boolean
}

export default function FormationForm({ initialData, isEditing }: FormationFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formationId, setFormationId] = useState<string | null>(initialData?.id || null)
  const [formationData, setFormationData] = useState(initialData || null)
  const [isLoading, setIsLoading] = useState(false)

  const handleBasicInfoSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const res = await fetch(
        isEditing ? `/api/users/content/formation/${initialData?.id}` : "/api/formations",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      )

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
    router.push("/profile/contenu")
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {step === 1 && (
        <FormationBasicInfo
          initialData={initialData}
          onSubmit={handleBasicInfoSubmit}
          isLoading={isLoading}
          isEditing={isEditing}
        />
      )}

      {step === 2 && formationId && (
        <FormationVideos
          formationId={formationId}
          initialVideos={initialData?.videos}
          onComplete={handleComplete}
          isEditing={isEditing}
        />
      )}
    </div>
  )
} 