"use client"

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TrashIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import FileUpload from '@/app/components/ui/file-upload'
import type { UploadResult } from '@/lib/cloudinary'

type VideoItem = {
  id: string
  title: string
  description: string
  videoUrl: string
  order: number
}

interface FormationVideosProps {
  formationId: string
  initialVideos?: any[]
  onComplete: () => void
  isEditing?: boolean
}

export default function FormationVideos({ formationId, initialVideos = [], onComplete, isEditing }: FormationVideosProps) {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentVideo, setCurrentVideo] = useState({
    title: '',
    description: '',
    videoUrl: ''
  })
  const [formation, setFormation] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Charger les détails de la formation
    const loadFormation = async () => {
      try {
        const res = await fetch(`/api/users/content/formation/${formationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Erreur lors du chargement de la formation')
        }
        
        const data = await res.json()
        setFormation(data)

        // Si nous avons des vidéos initiales, les charger directement
        if (data.videos?.length > 0) {
          const formattedVideos = data.videos
            .map((v: any) => ({
              id: v.video.id,
              title: v.video.title,
              description: v.video.description,
              videoUrl: v.video.videoUrl,
              order: v.order
            }))
            .sort((a: any, b: any) => a.order - b.order)

          setVideos(formattedVideos)
        }
      } catch (error: any) {
        console.error('Erreur:', error)
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de charger les détails de la formation',
          variant: 'destructive',
        })
      }
    }

    if (formationId) {
      loadFormation()
    }
  }, [formationId])

  const handleAddVideo = async () => {
    if (!currentVideo.title.trim() || !currentVideo.videoUrl) {
      toast({
        title: 'Erreur',
        description: 'Le titre et la vidéo sont requis',
        variant: 'destructive',
      })
      return
    }

    if (!formation) {
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les détails de la formation',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      // Récupérer la première catégorie comme catégorie par défaut
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      const defaultCategoryId = categoriesData[0]?.id

      if (!defaultCategoryId) {
        throw new Error('Aucune catégorie disponible')
      }

      const videoRes = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: currentVideo.title,
          description: currentVideo.description,
          videoUrl: currentVideo.videoUrl,
          coverImage: formation.imageUrl,
          coverImagePublicId: formation.imagePublicId,
          isPremium: false,
          price: null,
          categoryId: defaultCategoryId
        })
      })

      if (!videoRes.ok) {
        const error = await videoRes.json()
        throw new Error(error.message || 'Erreur lors de la création de la vidéo')
      }

      const video = await videoRes.json()
      if (!video?.id) throw new Error('La vidéo créée est invalide')

      // Ajouter la vidéo à la fin de la liste avec un ordre séquentiel
      const maxOrder = Math.max(...videos.map(v => v.order), -1)
      setVideos(prev => [
        ...prev,
        {
          id: video.id,
          title: video.title || currentVideo.title,
          description: video.description || currentVideo.description || '',
          videoUrl: video.videoUrl || currentVideo.videoUrl,
          order: maxOrder + 1
        }
      ])

      // Réinitialiser le formulaire
      setCurrentVideo({
        title: '',
        description: '',
        videoUrl: ''
      })

      toast({
        title: 'Succès',
        description: 'La vidéo a été ajoutée avec succès',
      })
    } catch (error: any) {
      console.error('Erreur création vidéo:', error)
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter la vidéo',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveVideo = (id: string) => {
    setVideos(prev => {
      const filtered = prev.filter(v => v.id !== id)
      // Réorganiser les ordres pour éviter les trous
      return filtered.map((v, index) => ({ ...v, order: index }))
    })
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(videos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Réassigner les ordres de manière séquentielle
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }))

    setVideos(reorderedItems)
  }

  const handleSubmit = async () => {
    if (videos.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Ajoutez au moins une vidéo à la formation',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      // S'assurer que les vidéos sont triées par ordre avant l'envoi
      const sortedVideos = [...videos].sort((a, b) => a.order - b.order)
      
      const res = await fetch(`/api/users/content/formation/${formationId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videos: sortedVideos })
      })

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde des vidéos')

      toast({
        title: 'Succès',
        description: 'Les vidéos ont été sauvegardées avec succès',
      })

      onComplete()
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les vidéos',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoUpload = (result: UploadResult) => {
    setCurrentVideo(prev => ({
      ...prev,
      videoUrl: result.url
    }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Ajouter une vidéo</h2>
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la vidéo</Label>
              <Input
                id="title"
                value={currentVideo.title}
                onChange={(e) => setCurrentVideo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de la vidéo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentVideo.description}
                onChange={(e) => setCurrentVideo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la vidéo"
                rows={3}
              />
            </div>
          </div>
          <FileUpload
            type="video"
            onUploadComplete={handleVideoUpload}
            onUploadError={(error: Error) => {
              console.error('Erreur upload vidéo:', error)
              toast({
                title: 'Erreur',
                description: 'Impossible d\'uploader la vidéo',
                variant: 'destructive',
              })
            }}
            value={currentVideo.videoUrl}
          />
          <Button
            onClick={handleAddVideo}
            disabled={!currentVideo.title.trim() || !currentVideo.videoUrl}
            className="w-full"
          >
            Ajouter la vidéo
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium mb-4">Vidéos de la formation (glisser-déposer pour réorganiser)</h3>
          <Droppable droppableId="videos-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {videos.map((video, index) => (
                  <Draggable
                    key={video.id}
                    draggableId={video.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center gap-2 p-2 bg-background rounded-lg border border-input"
                      >
                        <div className="cursor-move">
                          <Bars3Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{video.title}</p>
                          {video.description && (
                            <p className="text-sm text-muted-foreground">{video.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVideo(video.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isEditing ? 'Mettre à jour les vidéos' : 'Ajouter les vidéos'}
        </Button>
      </div>
    </div>
  )
} 