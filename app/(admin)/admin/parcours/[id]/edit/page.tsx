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

interface Formation {
  id: string
  title: string
  description: string
  imageUrl: string
}

interface Parcours {
  id: string
  title: string
  description: string
  imageUrl: string
  formations: {
    order: number
    formation: Formation
  }[]
}

export default function EditParcoursPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [selectedFormations, setSelectedFormations] = useState<Formation[]>([])
  const [availableFormations, setAvailableFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Charger les données du parcours
    fetch(`/api/parcours/${params.id}`)
      .then(res => res.json())
      .then((data: Parcours) => {
        setTitle(data.title)
        setDescription(data.description)
        setImageUrl(data.imageUrl)
        setSelectedFormations(
          data.formations
            .sort((a, b) => a.order - b.order)
            .map(f => f.formation)
        )
        
        // Charger toutes les formations disponibles
        return fetch('/api/formations')
          .then(res => res.json())
          .then(formations => {
            const selectedIds = new Set(data.formations.map(f => f.formation.id))
            setAvailableFormations(formations.filter((f: Formation) => !selectedIds.has(f.id)))
            setLoading(false)
          })
      })
      .catch(error => {
        console.error('Erreur lors du chargement:', error)
        setLoading(false)
      })
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/parcours/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          formations: selectedFormations.map((f, index) => ({
            formationId: f.id,
            order: index
          }))
        }),
      })

      if (res.ok) {
        router.push('/admin/parcours')
      } else {
        throw new Error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue lors de la mise à jour du parcours')
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
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
        <h1 className="text-2xl font-bold text-foreground">Modifier le Parcours</h1>
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
            <Label htmlFor="imageUrl">URL de l'image</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Formations du parcours</h2>
          
          {/* Liste des formations disponibles */}
          <div className="grid gap-4">
            <Label>Formations disponibles</Label>
            <div className="grid gap-2">
              {availableFormations.map((formation) => (
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
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  )
} 