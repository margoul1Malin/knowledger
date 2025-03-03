'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { PlusIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import FileUpload from '@/app/components/ui/file-upload'
import type { UploadResult } from '@/lib/cloudinary'
import { useAuth } from '@/app/hooks/useAuth'

type VideoItem = {
  id: string
  title: string
  description: string
  videoUrl: string
  videoPublicId: string
  order: number
}

type Props = {
  formationId: string
  onComplete: () => void
}

export default function FormationVideos({ formationId, onComplete }: Props) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [currentVideo, setCurrentVideo] = useState<Partial<VideoItem>>({})

  const handleAddVideo = () => {
    if (currentVideo.title && currentVideo.videoUrl) {
      setVideos([
        ...videos,
        {
          id: Date.now().toString(),
          title: currentVideo.title || '',
          description: currentVideo.description || '',
          videoUrl: currentVideo.videoUrl || '',
          videoPublicId: currentVideo.videoPublicId || '',
          order: videos.length
        }
      ])
      setCurrentVideo({})
    }
  }

  const handleRemoveVideo = (id: string) => {
    const newVideos = videos.filter(video => video.id !== id)
    const reorderedVideos = newVideos.map((video, index) => ({
      ...video,
      order: index
    }))
    setVideos(reorderedVideos)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(videos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }))

    setVideos(updatedItems)
  }

  const handleSubmit = async () => {
    if (videos.length === 0) {
      alert("Ajoutez au moins une vidéo à la formation")
      return
    }

    setIsLoading(true)
    try {
      const videosToSend = videos.map((video) => ({
        videoUrl: video.videoUrl,
        videoPublicId: video.videoPublicId,
        title: video.title,
        description: video.description,
        order: video.order
      }))

      const res = await fetch(`/api/admin/formations/${formationId}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videos: videosToSend
        }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de l'ajout des vidéos")
      }

      onComplete()
    } catch (error) {
      console.error('Erreur:', error)
      alert(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium mb-4">Ajouter une vidéo</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Titre de la vidéo"
            value={currentVideo.title || ''}
            onChange={e => setCurrentVideo({ ...currentVideo, title: e.target.value })}
            className="w-full p-2 rounded-lg border border-input bg-background"
          />
          <textarea
            placeholder="Description"
            value={currentVideo.description || ''}
            onChange={e => setCurrentVideo({ ...currentVideo, description: e.target.value })}
            className="w-full p-2 rounded-lg border border-input bg-background"
            rows={2}
          />
          <FileUpload
            type="video"
            onUploadComplete={(result: UploadResult) => {
              setCurrentVideo({
                ...currentVideo,
                videoUrl: result.url,
                videoPublicId: result.publicId
              })
            }}
            onUploadError={(error: Error) => {
              console.error('Erreur upload:', error)
            }}
            maxSize={100 * 1024 * 1024}
            className="w-full"
            value={currentVideo.videoUrl}
          />
          <button
            type="button"
            onClick={handleAddVideo}
            disabled={!currentVideo.title || !currentVideo.videoUrl}
            className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter la vidéo
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium mb-4">Vidéos de la formation (glisser-déposer pour réorganiser)</h3>
          <Droppable 
            droppableId="videos-list"
            isCombineEnabled={false}
            isDropDisabled={false}
            ignoreContainerClipping={false}
            type="video"
          >
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
                    isDragDisabled={false}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-2 p-2 bg-background rounded-lg border border-input
                          ${snapshot.isDragging ? 'opacity-50' : ''}`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-move"
                        >
                          <Bars3Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{video.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {video.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ordre: {video.order + 1}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(video.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
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

      <button
        onClick={handleSubmit}
        disabled={isLoading || videos.length === 0}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Création..." : "Terminer"}
      </button>
    </div>
  )
} 