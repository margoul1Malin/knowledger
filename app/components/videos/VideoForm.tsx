"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/app/hooks/useAuth'
import FileUpload from '@/app/components/ui/file-upload'
import type { UploadResult } from '@/lib/cloudinary'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

const videoSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  videoUrl: z.string().min(1, "La vidéo est requise"),
  coverImage: z.string().min(1, "L'image de couverture est requise"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  isPremium: z.boolean(),
  price: z.number()
}).superRefine((data, ctx) => {
  if (data.isPremium && data.price <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le prix doit être supérieur à 0 pour un contenu premium",
      path: ["price"]
    });
  }
});

type VideoForm = z.infer<typeof videoSchema>

interface VideoFormProps {
  initialData?: any
  isEditing?: boolean
}

export default function VideoForm({ initialData, isEditing }: VideoFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [markdownDescription, setMarkdownDescription] = useState(initialData?.description || '')

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<VideoForm>({
    resolver: zodResolver(videoSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      videoUrl: '',
      coverImage: '',
      categoryId: '',
      isPremium: false,
      price: 0
    }
  })

  const isPremium = watch("isPremium")

  useEffect(() => {
    if (!isPremium) {
      setValue('price', 0)
    }
  }, [isPremium, setValue])

  const onSubmit = async (data: VideoForm) => {
    setIsLoading(true)
    try {
      const formData = {
        ...data,
        authorId: user?.id,
        description: markdownDescription,
        price: data.isPremium ? data.price : 0
      }

      const res = await fetch(isEditing ? `/api/users/content/video/${initialData.id}` : "/api/videos", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Erreur lors de la création")
      router.push("/profile/contenu")
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoUpload = (result: UploadResult) => {
    setValue('videoUrl', result.url)
  }

  const handleCoverImageUpload = (result: UploadResult) => {
    setValue('coverImage', result.url)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <label className="block text-sm font-medium mb-2">Titre</label>
        <input
          {...register("title")}
          className="w-full p-2 rounded-lg border border-input bg-background"
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <div data-color-mode="auto">
          <MDEditor
            value={markdownDescription}
            onChange={(value) => {
              setMarkdownDescription(value || '')
              setValue('description', value || '', { 
                shouldValidate: true,
                shouldDirty: true
              })
            }}
            preview="live"
            height={300}
            className="w-full"
          />
        </div>
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Vidéo</label>
        <FileUpload
          type="video"
          onUploadComplete={handleVideoUpload}
          onUploadError={(error: Error) => {
            console.error('Erreur upload vidéo:', error)
          }}
          value={watch('videoUrl')}
        />
        {errors.videoUrl && (
          <p className="text-sm text-destructive mt-1">{errors.videoUrl.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Image de couverture</label>
        <FileUpload
          type="image"
          onUploadComplete={handleCoverImageUpload}
          onUploadError={(error: Error) => {
            console.error('Erreur upload image:', error)
          }}
          value={watch('coverImage')}
        />
        {errors.coverImage && (
          <p className="text-sm text-destructive mt-1">{errors.coverImage.message}</p>
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isPremium")}
          id="isPremium"
        />
        <label htmlFor="isPremium">Contenu Premium</label>
      </div>

      {isPremium && (
        <div>
          <label className="block text-sm font-medium mb-2">Prix</label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="w-full p-2 rounded-lg border border-input bg-background"
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
          )}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-input bg-background rounded-lg hover:bg-accent hover:text-accent-foreground"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : isEditing ? "Modifier" : "Créer"}
        </button>
      </div>
    </form>
  )
} 