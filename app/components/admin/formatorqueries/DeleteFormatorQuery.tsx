'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TrashIcon } from '@heroicons/react/24/outline'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface DeleteFormatorQueryProps {
  id: string
}

export default function DeleteFormatorQuery({ id }: DeleteFormatorQueryProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/formatorqueries/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erreur lors de la suppression')

      toast({
        title: 'Succès',
        description: 'La demande a été supprimée',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la demande',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <TrashIcon className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La demande sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 