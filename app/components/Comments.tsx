'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Commentaires</h2>
      
      {/* Formulaire de commentaire */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez votre commentaire..."
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Publication...' : 'Publier'}
          </Button>
        </form>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 p-4 bg-card rounded-lg border border-border">
            <Avatar>
              <AvatarImage src={comment.user.image || undefined} />
              <AvatarFallback>
                {comment.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{comment.user.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { 
                    addSuffix: true,
                    locale: fr 
                  })}
                </span>
              </div>
              <p className="text-foreground">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 