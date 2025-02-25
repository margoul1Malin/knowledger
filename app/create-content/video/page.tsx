'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/app/hooks/useAuth'
import FileUpload from '@/app/components/ui/FileUpload'
import { uploadFile } from '@/app/lib/upload'
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
  price: z.number().optional(),
})

type VideoForm = z.infer<typeof videoSchema>

export default function CreateVideo() {
  const router = useRouter()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [markdownDescription, setMarkdownDescription] = useState('')

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<VideoForm>({
    resolver: zodResolver(videoSchema)
  })

  const isPremium = watch("isPremium")

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  const onSubmit = async (data: VideoForm) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          authorId: user?.id,
        }),
      })

      if (!res.ok) throw new Error("Erreur lors de la création")
      router.push("/videos")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Créer une vidéo</h1>

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
              accept={{
                'video/*': ['.mp4']
              }}
              maxSize={100 * 1024 * 1024} // 100MB
              onUpload={(file) => uploadFile(file, 'video')}
              value={watch('videoUrl')}
              onChange={(url) => setValue('videoUrl', url)}
              previewType="video"
            />
            {errors.videoUrl && (
              <p className="text-sm text-destructive mt-1">{errors.videoUrl.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image de couverture</label>
            <FileUpload
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif']
              }}
              maxSize={5 * 1024 * 1024}
              onUpload={(file) => uploadFile(file, 'image')}
              value={watch("coverImage")}
              onChange={(url) => setValue("coverImage", url, { 
                shouldValidate: true,
                shouldDirty: true
              })}
              previewType="image"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Publication..." : "Publier la vidéo"}
          </button>
        </form>
      </div>
    </div>
  )
} 