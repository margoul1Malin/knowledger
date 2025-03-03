"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import FileUpload from '@/app/components/ui/file-upload'
import type { UploadResult } from '@/lib/cloudinary'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/hooks/useAuth'
import { toast } from '@/components/ui/use-toast'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

const formationSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  content: z.string().min(1, "Le contenu est requis"),
  coverImage: z.string().min(1, "L'image de couverture est requise"),
  imagePublicId: z.string().optional(),
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

type FormationForm = z.infer<typeof formationSchema>

interface FormationBasicInfoProps {
  initialData?: any
  isEditing?: boolean
  onComplete: () => void
}

export default function FormationBasicInfo({ initialData, isEditing, onComplete }: FormationBasicInfoProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [markdownContent, setMarkdownContent] = useState(initialData?.content || '')
  const [markdownDescription, setMarkdownDescription] = useState(initialData?.description || '')

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormationForm>({
    resolver: zodResolver(formationSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      content: initialData.content,
      coverImage: initialData.imageUrl,
      imagePublicId: initialData.imagePublicId,
      categoryId: initialData.categoryId,
      isPremium: initialData.isPremium,
      price: initialData.price || 0
    } : {
      title: '',
      description: '',
      content: '',
      coverImage: '',
      imagePublicId: '',
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

  const handleCoverImageUpload = async (result: UploadResult) => {
    if (isEditing && initialData?.imagePublicId && initialData.imagePublicId !== result.publicId) {
      try {
        console.log('Tentative de suppression de l\'ancienne image:', initialData.imagePublicId);
        const deleteRes = await fetch('/api/upload/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            publicId: initialData.imagePublicId
          })
        });

        if (!deleteRes.ok) {
          console.error('Réponse non-ok lors de la suppression:', await deleteRes.text());
        } else {
          console.log('Ancienne image supprimée avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'ancienne image:', error);
      }
    }

    setValue('coverImage', result.url);
    setValue('imagePublicId', result.publicId);
  }

  const handleFormSubmit = async (data: FormationForm) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        authorId: user?.id,
        description: markdownDescription,
        content: markdownContent,
        price: data.isPremium ? data.price : 0,
        imageUrl: data.coverImage,
        imagePublicId: data.imagePublicId,
        updateVideoCoverImages: data.imagePublicId !== initialData?.imagePublicId
      }

      const res = await fetch(isEditing ? `/api/users/content/formation/${initialData.id}` : "/api/formations", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la modification");
      }
      
      onComplete();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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