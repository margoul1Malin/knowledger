'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import UserInfo from '@/components/profile/UserInfo'
import PurchaseHistory from '@/components/profile/PurchaseHistory'
import HistorySection from '@/components/profile/HistorySection'
import CreatorContent from '@/components/profile/CreatorContent'
import { UserRole } from '@prisma/client'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: Implémenter la mise à jour du profil
  }

  const isCreator = session?.user?.role === UserRole.FORMATOR || session?.user?.role === UserRole.ADMIN

  return (
    <div className="container py-8 space-y-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-6">Informations personnelles</h1>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || ''}
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-24 w-24 text-muted-foreground" />
              )}
              <button
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
                title="Changer la photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
              <p className="text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={session?.user?.name || ''}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-muted border border-input rounded-lg cursor-not-allowed"
              />
              <p className="text-sm text-muted-foreground mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                Mot de passe actuel
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 