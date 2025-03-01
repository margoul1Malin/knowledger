'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, PublicProfileAddons } from '@prisma/client'
import { useToast } from '@/app/hooks/useToast'

type ProfileWithAddons = User & {
  publicProfile: PublicProfileAddons | null
}

export default function EditProfileForm({ profile }: { profile: ProfileWithAddons }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    bio: profile.publicProfile?.bio || '',
    expertise: profile.publicProfile?.expertise || [],
    location: profile.publicProfile?.location || '',
    website: profile.publicProfile?.website || '',
    github: profile.publicProfile?.github || '',
    socialLinks: profile.publicProfile?.socialLinks || {}
  })

  // Ajout d'un état local pour gérer l'input d'expertise
  const [expertiseInput, setExpertiseInput] = useState(
    profile.publicProfile?.expertise?.join(', ') || ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/users/profile/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Erreur lors de la mise à jour')

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.'
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExpertiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setExpertiseInput(value)
    
    // Mise à jour du formData uniquement lorsque nécessaire
    const expertiseArray = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
    
    setFormData(prev => ({
      ...prev,
      expertise: expertiseArray
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Biographie
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full h-32 px-3 py-2 bg-background border border-input rounded-md"
          placeholder="Parlez de vous, votre expérience..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Expertise (séparées par des virgules)
        </label>
        <input
          type="text"
          value={expertiseInput}
          onChange={handleExpertiseChange}
          className="w-full px-3 py-2 bg-background border border-input rounded-md"
          placeholder="JavaScript, React, Node.js..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Localisation
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 bg-background border border-input rounded-md"
          placeholder="Paris, France"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Site web
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full px-3 py-2 bg-background border border-input rounded-md"
          placeholder="https://monsite.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          GitHub
        </label>
        <input
          type="url"
          value={formData.github}
          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
          className="w-full px-3 py-2 bg-background border border-input rounded-md"
          placeholder="https://github.com/username"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </form>
  )
}
