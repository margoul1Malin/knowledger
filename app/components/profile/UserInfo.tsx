'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { UserRole } from '@prisma/client'

export default function UserInfo() {
  const { data: session } = useSession()
  const showPremiumBanner = session?.user?.role === UserRole.NORMAL

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-6">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || ''}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <UserCircleIcon className="h-20 w-20 text-muted-foreground" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
            <p className="text-muted-foreground">{session?.user?.email}</p>
            <p className="text-sm text-primary mt-1">
              {session?.user?.role === UserRole.ADMIN && 'Administrateur'}
              {session?.user?.role === UserRole.FORMATOR && 'Formateur'}
              {session?.user?.role === UserRole.PREMIUM && 'Membre Premium'}
              {session?.user?.role === UserRole.NORMAL && 'Membre'}
            </p>
          </div>
        </div>
      </div>

      {showPremiumBanner && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Passez à l'offre Premium
              </h2>
              <p className="text-muted-foreground">
                Accédez à tout le contenu et profitez de fonctionnalités exclusives.
              </p>
            </div>
            <Link
              href="/premium"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <SparklesIcon className="h-5 w-5" />
              <span>Devenir Premium</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
} 