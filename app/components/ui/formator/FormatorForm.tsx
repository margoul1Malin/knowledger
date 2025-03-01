'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  skills: z.string().min(1, 'Veuillez entrer au moins une compétence'),
  wantArticles: z.boolean(),
  wantVideos: z.boolean(),
  wantFormations: z.boolean(),
  message: z.string().min(50, 'Le message doit contenir au moins 50 caractères'),
}).refine(data => {
  return data.wantArticles || data.wantVideos || data.wantFormations
}, {
  message: "Veuillez sélectionner au moins un type de contenu",
  path: ["wantArticles"]
})

type FormData = z.infer<typeof formSchema>

export default function FormatorForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wantArticles: false,
      wantVideos: false,
      wantFormations: false
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // Convertir les compétences en tableau
      const skills = data.skills.split(',').map(skill => skill.trim()).filter(Boolean)

      const formDataToSend = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        skills,
        wantArticles: data.wantArticles,
        wantVideos: data.wantVideos,
        wantFormations: data.wantFormations,
        message: data.message
      }

      console.log('Données à envoyer:', formDataToSend)

      // Envoyer la demande
      const res = await fetch('/api/formator/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataToSend)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur lors de l\'envoi de la demande')
      }

      toast({
        title: "🎉 Félicitations !",
        description: (
          <div className="space-y-2">
            <p>Votre candidature a été envoyée avec succès !</p>
            <p>Notre équipe l'examinera dans les plus brefs délais et vous contactera par email.</p>
            <p className="font-semibold">Merci de votre intérêt pour Knowledger !</p>
          </div>
        ),
        duration: 6000
      })

      reset()
    } catch (error) {
      console.error(error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Prénom *
          </label>
          <Input
            {...register('firstName')}
            placeholder="Votre prénom"
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nom *
          </label>
          <Input
            {...register('lastName')}
            placeholder="Votre nom"
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Email *
        </label>
        <Input
          {...register('email')}
          type="email"
          placeholder="votre@email.com"
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Téléphone
        </label>
        <Input
          {...register('phone')}
          type="tel"
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Compétences *
        </label>
        <Input
          {...register('skills')}
          placeholder="JavaScript, React, Node.js..."
          className={errors.skills ? 'border-destructive' : ''}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Séparez vos compétences par des virgules
        </p>
        {errors.skills && (
          <p className="text-sm text-destructive mt-1">{errors.skills.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-4">
          Type de contenu souhaité *
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <Controller
              name="wantArticles"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="wantArticles"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <label htmlFor="wantArticles" className="ml-2">
              Articles
            </label>
          </div>
          <div className="flex items-center">
            <Controller
              name="wantVideos"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="wantVideos"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <label htmlFor="wantVideos" className="ml-2">
              Vidéos
            </label>
          </div>
          <div className="flex items-center">
            <Controller
              name="wantFormations"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="wantFormations"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <label htmlFor="wantFormations" className="ml-2">
              Formations
            </label>
          </div>
        </div>
        {errors.wantArticles && (
          <p className="text-sm text-destructive mt-1">{errors.wantArticles.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Message *
        </label>
        <Textarea
          {...register('message')}
          placeholder="Présentez-vous et expliquez-nous pourquoi vous souhaitez devenir formateur..."
          className={`min-h-[150px] ${errors.message ? 'border-destructive' : ''}`}
        />
        {errors.message && (
          <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          'Envoyer ma candidature'
        )}
      </Button>
    </form>
  )
} 