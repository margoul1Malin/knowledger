'use client'

import { useState } from 'react'
import { User } from '@prisma/client'
import { useRouter } from 'next/navigation'

type Props = {
  users: User[]
}

export default function UsersList({ users }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) throw new Error('Erreur lors de la mise à jour')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erreur lors de la suppression')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Nom</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Rôle</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/50">
              <td className="px-6 py-4 text-sm text-foreground">{user.name}</td>
              <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
              <td className="px-6 py-4 text-sm">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={isLoading}
                  className="bg-background border border-input rounded px-2 py-1 text-sm text-foreground"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="FORMATOR">Formateur</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 text-sm">
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 