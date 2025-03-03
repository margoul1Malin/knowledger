'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Label } from '@/app/components/ui/label'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { GripVertical } from 'lucide-react'
import FileUpload from '@/app/components/ui/file-upload'
import type { UploadResult } from '@/lib/cloudinary'
import Image from 'next/image'

interface Formation {
  id: string
  title: string
  description: string
  imageUrl: string
}

export default function NewParcoursPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePublicId, setImagePublicId] = useState('')
  const [selectedFormations, setSelectedFormations] = useState<Formation[]>([])
  const [availableFormations, setAvailableFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Charger les formations disponibles
    fetch('/api/formations')
      .then(res => res.json())
      .then(data => {
        console.log('Formations reçues:', data)
        if (data.items && Array.isArray(data.items)) {
          setAvailableFormations(data.items)
        } else {
          console.error('Format de données inattendu:', data)
          setAvailableFormations([])
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des formations:', error)
        setAvailableFormations([])
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/parcours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          imagePublicId,
          formations: selectedFormations.map((f, index) => ({
            formationId: f.id,
            order: index
          }))
        }),
      })

      if (res.ok) {
        router.push('/admin/parcours')
      } else {
        throw new Error('Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue lors de la création du parcours')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(selectedFormations)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedFormations(items)
  }

  const addFormation = (formation: Formation) => {
    setSelectedFormations([...selectedFormations, formation])
    setAvailableFormations(availableFormations.filter(f => f.id !== formation.id))
  }

  const removeFormation = (formation: Formation) => {
    setSelectedFormations(selectedFormations.filter(f => f.id !== formation.id))
    setAvailableFormations([...availableFormations, formation])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/parcours')}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Nouveau Parcours</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Image de couverture</Label>
            <div className="flex flex-col gap-4 items-start">
              {imageUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Aperçu"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageUrl('')
                      setImagePublicId('')
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              ) : (
                <FileUpload
                  type="image"
                  onUploadComplete={(result: UploadResult) => {
                    setImageUrl(result.url)
                    setImagePublicId(result.publicId)
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Erreur: ${error.message}`)
                  }}
                  value={imageUrl}
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Formations du parcours</h2>
          
          {/* Liste des formations disponibles */}
          <div className="grid gap-4">
            <Label>Formations disponibles</Label>
            <div className="grid gap-2">
              {availableFormations?.map((formation) => (
                <div
                  key={formation.id}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                >
                  <span className="font-medium">{formation.title}</span>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addFormation(formation)}
                  >
                    Ajouter
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Liste des formations sélectionnées */}
          <div className="grid gap-4">
            <Label>Formations sélectionnées</Label>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="formations">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid gap-2"
                  >
                    {selectedFormations.map((formation, index) => (
                      <Draggable
                        key={formation.id}
                        draggableId={formation.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab"
                              >
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <span className="font-medium">{formation.title}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeFormation(formation)}
                            >
                              Retirer
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/parcours')}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading || !imageUrl}>
            {loading ? 'Création...' : 'Créer le parcours'}
          </Button>
        </div>
      </form>
    </div>
  )
} 