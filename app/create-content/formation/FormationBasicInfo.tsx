'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import FileUpload from '@/app/components/ui/FileUpload'

const formationSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  content: z.string().min(1, "Le contenu est requis"),
  imageUrl: z.string().min(1, "L'image de couverture est requise"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  isPremium: z.boolean(),
  price: z.number().min(0, "Le prix doit être positif").optional(),
})

type FormationForm = z.infer<typeof formationSchema>

type Props = {
  onSubmit: (data: FormationForm) => void
  isLoading: boolean
}

export default function FormationBasicInfo({ onSubmit, isLoading }: Props) {
  const [categories, setCategories] = useState([])
  const [isPremium, setIsPremium] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormationForm>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      isPremium: false,
      price: 0
    }
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <label className="block text-sm font-medium mb-2">Titre</label>
        <input
          type="text"
          {...register("title")}
          className="w-full p-2 rounded-lg border border-input bg-background"
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          {...register("description")}
          className="w-full p-2 rounded-lg border border-input bg-background"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Contenu détaillé</label>
        <textarea
          {...register("content")}
          className="w-full p-2 rounded-lg border border-input bg-background"
          rows={5}
        />
        {errors.content && (
          <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image de couverture</label>
        <FileUpload
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/gif': ['.gif']
          }}
          maxSize={5 * 1024 * 1024} // 5MB
          onUpload={async (file) => {
            try {
              const formData = new FormData()
              formData.append('file', file)
              formData.append('type', 'image')

              const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })

              if (!res.ok) throw new Error('Erreur lors de l\'upload')

              const data = await res.json()
              return data.url
            } catch (error) {
              console.error('Erreur upload:', error)
              throw error
            }
          }}
          value={watch("imageUrl")}
          onChange={(url) => setValue("imageUrl", url)}
          previewType="image"
        />
        {errors.imageUrl && (
          <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Catégorie</label>
        <select
          {...register("categoryId")}
          className="w-full p-2 rounded-lg border border-input bg-background"
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((category: any) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="isPremium"
            checked={isPremium}
            onChange={(e) => {
              setIsPremium(e.target.checked)
              setValue('isPremium', e.target.checked)
            }}
          />
          <label htmlFor="isPremium">Formation Premium</label>
        </div>

        {isPremium && (
          <div>
            <label className="block text-sm font-medium mb-2">Prix</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { 
                valueAsNumber: true,
                required: isPremium
              })}
              className="w-full p-2 rounded-lg border border-input bg-background"
            />
            {errors.price && (
              <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Création..." : "Suivant"}
      </button>
    </form>
  )
} 