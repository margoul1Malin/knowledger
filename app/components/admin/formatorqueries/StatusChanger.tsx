'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/components/ui/use-toast'

interface StatusChangerProps {
  id: string
  currentStatus: string
  email: string
}

export default function StatusChanger({ id, currentStatus, email }: StatusChangerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/formatorqueries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, email }),
      })

      if (!res.ok) throw new Error('Erreur lors du changement de statut')

      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la demande a été modifié avec succès.',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sélectionner un statut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">En attente</SelectItem>
        <SelectItem value="APPROVED">Approuvé</SelectItem>
        <SelectItem value="REJECTED">Rejeté</SelectItem>
      </SelectContent>
    </Select>
  )
} 