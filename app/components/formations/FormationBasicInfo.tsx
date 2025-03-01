"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import FileUpload from '@/app/components/ui/FileUpload'
import { uploadFile } from '@/app/lib/upload'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

const formationSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  content: z.string().min(1, "Le contenu est requis"),
  imageUrl: z.string().min(1, "L'image de couverture est requise"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  isPremium: z.boolean(),
  price: z.number().optional(),
})

type FormationForm = z.infer<typeof formationSchema>

interface FormationBasicInfoProps {
  initialData?: any
  onSubmit: (data: FormationForm) => void
  isLoading: boolean
  isEditing?: boolean
}

export default function FormationBasicInfo({ initialData, onSubmit, isLoading, isEditing }: FormationBasicInfoProps) {
  const [categories, setCategories] = useState([])
  const [markdownDescription, setMarkdownDescription] = useState(initialData?.description || '')
  const [markdownContent, setMarkdownContent] = useState(initialData?.content || '')

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormationForm>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      imageUrl: initialData?.imageUrl || '',
      categoryId: initialData?.categoryId || '',
      isPremium: initialData?.isPremium || false,
      price: initialData?.price || 0,
    }
  })

  const isPremium = watch("isPremium")

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  const handleFormSubmit = async (data: FormationForm) => {
    onSubmit({
      ...data,
      description: markdownDescription,
      content: markdownContent,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
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
        <label className="block text-sm font-medium mb-2">Description courte</label>
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
            height={200}
            className="w-full"
          />
        </div>
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Contenu détaillé</label>
        <div data-color-mode="auto">
          <MDEditor
            value={markdownContent}
            onChange={(value) => {
              setMarkdownContent(value || '')
              setValue('content', value || '', { 
                shouldValidate: true,
                shouldDirty: true
              })
            }}
            preview="live"
            height={400}
            className="w-full"
          />
        </div>
        {errors.content && (
          <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
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
          value={watch("imageUrl")}
          onChange={(url) => setValue("imageUrl", url, { 
            shouldValidate: true,
            shouldDirty: true
          })}
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isPremium")}
          id="isPremium"
        />
        <label htmlFor="isPremium">Formation Premium</label>
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
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Enregistrement..." : isEditing ? "Modifier" : "Suivant"}
      </button>
    </form>
  )
} 