'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  UsersIcon, 
  NewspaperIcon, 
  VideoCameraIcon, 
  AcademicCapIcon, 
  HomeIcon, 
  TagIcon, 
  LightBulbIcon,
  InboxIcon,
  UserPlusIcon 
} from '@heroicons/react/24/outline'

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: UsersIcon,
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: InboxIcon,
  },
  {
    name: 'Demandes Formateur',
    href: '/admin/formatorqueries',
    icon: UserPlusIcon,
  },
  {
    name: 'Catégories',
    href: '/admin/categories',
    icon: TagIcon,
  },
  {
    name: 'Articles',
    href: '/admin/articles',
    icon: NewspaperIcon,
  },
  {
    name: 'Vidéos',
    href: '/admin/videos',
    icon: VideoCameraIcon,
  },
  {
    name: 'Vidéos de Formation',
    href: '/admin/videoformations',
    icon: VideoCameraIcon,
  },
  {
    name: 'Formations',
    href: '/admin/formations',
    icon: AcademicCapIcon,
  },
  {
    name: 'Pense-Bête',
    href: '/admin/todo',
    icon: LightBulbIcon,
    description: 'Fonctionnalités futures à implémenter'
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen fixed">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Administration</h2>
      </div>
      <nav className="space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
} 