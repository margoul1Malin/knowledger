'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  UserCircle,
  History,
  Bell,
  ShieldCheck,
  CreditCard,
  FileText,
  Menu,
  X,
  PenSquare,
  ShoppingBag,
  Home
} from 'lucide-react'

type NavLink = {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  roles?: UserRole[]
}

const navLinks: NavLink[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
    exact: true
  },
  {
    href: '/profile',
    label: 'Infos Personnelles',
    icon: UserCircle,
    exact: true
  },
  {
    href: '/profile/historique',
    label: 'Historique',
    icon: History,
    roles: [UserRole.PREMIUM, UserRole.ADMIN, UserRole.FORMATOR]
  },
  {
    href: '/profile/achats',
    label: 'Mes Achats',
    icon: ShoppingBag,
  },
  {
    href: '/profile/notifications',
    label: 'Notifications',
    icon: Bell
  },
  {
    href: '/profile/securite',
    label: 'Sécurité',
    icon: ShieldCheck
  },
  {
    href: '/profile/abonnement',
    label: 'Abonnement',
    icon: CreditCard
  },
  {
    href: '/profile/contenu',
    label: 'Mon contenu',
    icon: FileText,
    roles: [UserRole.ADMIN, UserRole.FORMATOR]
  },
  {
    href: '/profile/edit',
    label: 'Profil Public',
    icon: PenSquare,
    roles: [UserRole.ADMIN, UserRole.FORMATOR]
  }
]

export default function ProfileSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const isLinkActive = (href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const filteredLinks = navLinks.filter(link => 
    !link.roles || link.roles.includes(session?.user?.role as UserRole)
  )

  return (
    <>
      {/* Menu mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Menu du profil</h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-accent rounded-md"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="fixed top-[60px] left-0 right-0 bottom-0 bg-background/95 backdrop-blur-sm border-b border-border overflow-y-auto">
            <nav className="flex flex-col p-4 space-y-2">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isLinkActive(link.href, link.exact)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:block fixed top-0 left-0 w-64 h-screen border-r border-border">
        <div className="flex flex-col h-full pt-24 pb-4">
          <div className="px-4 mb-8">
            <h2 className="text-lg font-semibold">Menu du profil</h2>
          </div>
          <nav className="flex-1 px-2 space-y-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isLinkActive(link.href, link.exact)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
} 