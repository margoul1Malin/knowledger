'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
  }
}

interface CommentsProps {
  itemId: string
  itemType: 'article' | 'video' | 'formation'
}

export default function Comments({ itemId, itemType }: CommentsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [itemId, itemType])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?itemId=${itemId}&itemType=${itemType}`)
      const data = await res.json()
      setComments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour commenter.",
        variant: "destructive"
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          itemId,
          itemType
        })
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setComments(prev => [data, ...prev])
      setNewComment('')
      toast({
        title: "Succès",
        description: "Votre commentaire a été publié.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de publier votre commentaire.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!user) return

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error()

      setComments(prev => prev.filter(comment => comment.id !== commentId))
      toast({
        title: "Succès",
        description: "Votre commentaire a été supprimé.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Commentaires</h2>
      
      {/* Formulaire de commentaire */}
      {user && (
        <div className="bg-card border border-border rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isLoading}
              className="min-h-[100px] bg-background"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Publication...' : 'Publier'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div
            key={comment.id}
            className={cn(
              "bg-card border border-border rounded-lg p-4 transition-colors hover:bg-card/50",
              index === 0 && "animate-in fade-in-0 slide-in-from-top-4"
            )}
          >
            <div className="flex space-x-4">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={comment.user.image || undefined} />
                <AvatarFallback>
                  {comment.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{comment.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </p>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
                {user && comment.user.id === user.id && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun commentaire pour le moment. Soyez le premier à commenter !
          </div>
        )}
      </div>
    </div>
  )
} 