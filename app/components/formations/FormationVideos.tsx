"use client"

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TrashIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import FileUpload from '@/components/ui/FileUpload'

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
  const { toast } = useToast()

  useEffect(() => {
    if (isEditing) {
      // Charger les vidéos existantes
      const loadVideos = async () => {
        try {
          const res = await fetch(`/api/videos?formationId=${formationId}`)
          if (!res.ok) throw new Error('Erreur lors du chargement des vidéos')
          const data = await res.json()
          
          const formattedVideos = data.items
            .map((v: any) => ({
              id: v.id,
              title: v.title,
              description: v.description,
              videoUrl: v.videoUrl,
              order: v.formations?.[0]?.order || 0
            }))
            .sort((a: any, b: any) => a.order - b.order)

          setVideos(formattedVideos)
        } catch (error) {
          console.error('Erreur:', error)
          toast({
            title: 'Erreur',
            description: 'Impossible de charger les vidéos',
            variant: 'destructive',
          })
        }
      }

      loadVideos()
    }
  }, [isEditing, formationId])

  const handleAddVideo = async () => {
    if (!currentVideo.title.trim() || !currentVideo.videoUrl) {
      toast({
        title: 'Erreur',
        description: 'Le titre et la vidéo sont requis',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      const videoRes = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: currentVideo.title,
          description: currentVideo.description,
          videoUrl: currentVideo.videoUrl
        })
      })

      if (!videoRes.ok) throw new Error('Erreur lors de la création de la vidéo')

      const video = await videoRes.json()
      if (!video?.id) throw new Error('La vidéo créée est invalide')

      setVideos(prev => [
        ...prev,
        {
          id: video.id,
          title: video.title || currentVideo.title,
          description: video.description || currentVideo.description || '',
          videoUrl: video.videoUrl || currentVideo.videoUrl,
          order: prev.length
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
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la vidéo',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveVideo = (id: string) => {
    setVideos(prev => {
      const filtered = prev.filter(v => v.id !== id)
      return filtered.map((v, index) => ({ ...v, order: index }))
    })
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(videos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

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
      // Mettre à jour directement les vidéos sans supprimer les existantes
      const res = await fetch(`/api/users/content/formation/${formationId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videos })
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
            accept={{
              'video/*': ['.mp4', '.webm']
            }}
            maxSize={100 * 1024 * 1024}
            onUpload={async (file) => {
              try {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('type', 'video')

                const res = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData
                })

                if (!res.ok) {
                  const error = await res.json()
                  throw new Error(error.message || 'Erreur lors de l\'upload')
                }

                const data = await res.json()
                return data.url
              } catch (error) {
                console.error('Erreur upload:', error)
                throw error
              }
            }}
            value={currentVideo.videoUrl}
            onChange={(url) => setCurrentVideo(prev => ({ ...prev, videoUrl: url }))}
            previewType="video"
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