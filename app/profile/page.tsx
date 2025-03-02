'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline'
import { UserRole } from '@prisma/client'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  
  // Log la session au chargement
  useEffect(() => {
    if (session?.user) {
      console.log('Session actuelle:', {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      })
    }
  }, [session])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Prévisualisation de l'image
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Ne pas envoyer les champs de mot de passe si vides
      const currentPassword = formData.get('currentPassword')
      const newPassword = formData.get('newPassword')
      const confirmPassword = formData.get('confirmPassword')

      // Validation du mot de passe
      if (newPassword || currentPassword || confirmPassword) {
        if (!currentPassword) {
          toast.error('Veuillez entrer votre mot de passe actuel')
          return
        }
        if (!newPassword) {
          toast.error('Veuillez entrer un nouveau mot de passe')
          return
        }
        if (newPassword !== confirmPassword) {
          toast.error('Les mots de passe ne correspondent pas')
          return
        }
        if (typeof newPassword === 'string' && newPassword.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères')
          return
        }
      } else {
        // Si aucun champ de mot de passe n'est rempli, les retirer du FormData
        formData.delete('currentPassword')
        formData.delete('newPassword')
        formData.delete('confirmPassword')
      }

      // Ajout de l'image si elle a été modifiée
      const fileInput = fileInputRef.current
      if (fileInput?.files?.[0]) {
        formData.append('image', fileInput.files[0])
      }

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Mise à jour de la session avec les nouvelles données
      await updateSession()
      
      // Réinitialisation des champs de mot de passe
      if (formRef.current) {
        const passwordInputs = formRef.current.querySelectorAll<HTMLInputElement>('input[type="password"]')
        passwordInputs.forEach(input => {
          input.value = ''
        })
      }
      
      // Réinitialisation de l'aperçu de l'image seulement si pas de nouvelle image
      if (!data.user.image) {
        setPreviewImage(null)
      } else {
        // Force le rafraîchissement de l'image en ajoutant un timestamp
        const timestamp = new Date().getTime()
        setPreviewImage(`${data.user.image}?t=${timestamp}`)
      }
      
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const isCreator = session?.user?.role === UserRole.FORMATOR || session?.user?.role === UserRole.ADMIN

  return (
    <div className="container py-4 lg:py-8 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
          <h1 className="text-xl lg:text-2xl font-bold mb-6">Informations personnelles</h1>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <div 
                onClick={handleImageClick}
                className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
              >
                {(!imageError && (previewImage || session?.user?.image)) ? (
                  <Image
                    src={previewImage || session?.user?.image || ''}
                    alt={session?.user?.name || ''}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    unoptimized
                    onError={() => {
                      console.error('Erreur de chargement de l\'image:', session?.user?.image)
                      setImageError(true)
                    }}
                  />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg lg:text-xl font-semibold">{session?.user?.name}</h2>
              <p className="text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={session?.user?.name || ''}
                className="w-full px-3 lg:px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={session?.user?.email || ''}
                disabled
                className="w-full px-3 lg:px-4 py-2 bg-muted border border-input rounded-lg cursor-not-allowed"
              />
              <p className="text-sm text-muted-foreground mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                Mot de passe actuel
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className="w-full px-3 lg:px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="w-full px-3 lg:px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-3 lg:px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 