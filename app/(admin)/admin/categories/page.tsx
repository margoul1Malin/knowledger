'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug doit être en minuscules, sans espaces ni caractères spéciaux"),
})

type CategoryForm = z.infer<typeof categorySchema>

type Category = {
  id: string
  name: string
  slug: string
  createdAt: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema)
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  const onSubmit = async (data: CategoryForm) => {
    setIsLoading(true)
    try {
      const url = editingId 
        ? `/api/categories/${editingId}`
        : '/api/categories'
      
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
      
      await fetchCategories()
      reset()
      setEditingId(null)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setValue('name', category.name)
    setValue('slug', category.slug)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erreur lors de la suppression')
      
      await fetchCategories()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des catégories</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <input
                {...register("name")}
                onChange={(e) => {
                  register("name").onChange(e)
                  // Auto-générer le slug lors de la saisie du nom
                  setValue("slug", generateSlug(e.target.value))
                }}
                className="w-full p-2 rounded-lg border border-input bg-background"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                {...register("slug")}
                className="w-full p-2 rounded-lg border border-input bg-background"
              />
              {errors.slug && (
                <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? 'Sauvegarde...' : (editingId ? 'Modifier' : 'Créer')}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setEditingId(null)
                  }}
                  className="py-2 px-4 bg-muted text-muted-foreground rounded-lg hover:bg-muted/90"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Liste des catégories</h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-2 bg-background rounded-lg border border-input"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1 text-destructive hover:text-destructive/80"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 