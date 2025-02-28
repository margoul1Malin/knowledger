'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Trash2, AlertCircle, Crown, GraduationCap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  subject: string
  content: string
  status: string
  createdAt: string
  user: {
    name: string
    email: string
    role: string
  }
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    try {
      const response = await fetch('/api/messages')
      if (!response.ok) throw new Error('Erreur lors du chargement des messages')
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateMessageStatus(messageId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut')
      
      await fetchMessages()
      
      toast({
        title: "Succès",
        description: "Le statut du message a été mis à jour",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    }
  }

  async function deleteMessage(messageId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return
    }

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erreur lors de la suppression')
      
      setMessages(messages.filter(msg => msg.id !== messageId))
      
      toast({
        title: "Succès",
        description: "Le message a été supprimé",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive",
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'FORMATOR':
        return 'bg-emerald-100 border-emerald-500 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] text-emerald-950'
      case 'PREMIUM':
        return 'bg-amber-100 border-amber-500 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] text-amber-950'
      default:
        return 'bg-card border-border text-foreground'
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'FORMATOR':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-emerald-600 text-white">
            <GraduationCap className="h-3.5 w-3.5" />
            Formateur
          </span>
        )
      case 'PREMIUM':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-amber-600 text-white">
            <Crown className="h-3.5 w-3.5" />
            Premium
          </span>
        )
      default:
        return null
    }
  }

  const filteredMessages = selectedStatus === 'ALL' 
    ? messages 
    : messages.filter(msg => msg.status === selectedStatus)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages des Utilisateurs</h1>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="ALL">Tous les messages</option>
          <option value="UNREAD">Non lus</option>
          <option value="READ">Lus</option>
          <option value="ARCHIVED">Archivés</option>
        </select>
      </div>

      <AnimatePresence>
        <div className="grid gap-6">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-lg p-6 border transition-all duration-300 hover:shadow-lg ${getRoleColor(message.user.role)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{message.subject}</h3>
                    {message.status === 'UNREAD' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm opacity-90 flex items-center gap-2">
                      De: {message.user.name}
                      {getRoleBadge(message.user.role)}
                    </p>
                    <p className="text-sm opacity-75">
                      Le: {format(new Date(message.createdAt), 'PPP à pp', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={message.status}
                    onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                    className="text-sm border rounded-md p-1.5 bg-background text-foreground border-input"
                  >
                    <option value="UNREAD">Non lu</option>
                    <option value="READ">Lu</option>
                    <option value="ARCHIVED">Archivé</option>
                  </select>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMessage(message.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="whitespace-pre-wrap mt-4 opacity-90">{message.content}</p>
            </motion.div>
          ))}
          {filteredMessages.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucun message {selectedStatus !== 'ALL' ? 'dans cette catégorie' : ''} pour le moment
            </p>
          )}
        </div>
      </AnimatePresence>
    </div>
  )
} 