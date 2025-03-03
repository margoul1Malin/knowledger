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
  const [step, setStep] = useState(1)
  const [formationId, setFormationId] = useState(initialData?.id || '')
  const router = useRouter()

  const handleBasicInfoComplete = () => {
    if (isEditing) {
      setStep(2)
    } else {
      router.push('/profile/contenu')
      router.refresh()
    }
  }

  const handleVideosComplete = () => {
    router.push('/profile/contenu')
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {step === 1 && (
        <FormationBasicInfo
          initialData={initialData}
          isEditing={isEditing}
          onComplete={handleBasicInfoComplete}
        />
      )}
      {step === 2 && isEditing && (
        <FormationVideos
          formationId={formationId}
          initialVideos={initialData?.videos}
          onComplete={handleVideosComplete}
          isEditing={true}
        />
      )}
    </div>
  )
} 