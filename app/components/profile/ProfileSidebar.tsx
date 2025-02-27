'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import {
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon,
  BellIcon,
  ShoppingBagIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'

const links = [
  {
    href: '/profile',
    label: 'Infos Personnelles',
    icon: UserIcon,
    exact: true
  },
  {
    href: '/profile/historique',
    label: 'Historique',
    icon: ClockIcon,
    roles: [UserRole.ADMIN, UserRole.FORMATOR, UserRole.PREMIUM]
  },
  {
    href: '/profile/achats',
    label: 'Mes Achats',
    icon: ShoppingBagIcon,
    roles: [UserRole.NORMAL]
  },
  {
    href: '/profile/contenu',
    label: 'Mon Contenu',
    icon: DocumentTextIcon,
    roles: [UserRole.ADMIN, UserRole.FORMATOR]
  },
  {
    href: '/profile/abonnement',
    label: 'Abonnement',
    icon: SparklesIcon
  },
  {
    href: '/profile/notifications',
    label: 'Notifications',
    icon: BellIcon
  },
  {
    href: '/profile/edit',
    label: 'Public Profile',
    icon: PencilSquareIcon,
    roles: [UserRole.ADMIN, UserRole.FORMATOR]
  }
]

export default function ProfileSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isLinkActive = (href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen pt-24 px-4 border-r border-border bg-background">
      <nav className="space-y-1">
        {links.map((link) => {
          // Si le lien nécessite un rôle spécifique et que l'utilisateur n'a pas ce rôle, on ne l'affiche pas
          if (link.roles && !link.roles.includes(session?.user?.role as UserRole)) {
            return null
          }

          const isActive = isLinkActive(link.href, link.exact)
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
} 