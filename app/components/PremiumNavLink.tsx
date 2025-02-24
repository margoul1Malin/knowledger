'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function PremiumNavLink() {
  const { data: session } = useSession()

  if (session?.user?.role !== 'NORMAL') return null

  return (
    <Link
      href="/premium"
      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
    >
      <SparklesIcon className="h-5 w-5" />
      <span className="font-medium">Devenir Premium</span>
    </Link>
  )
} 