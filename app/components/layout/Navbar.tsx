'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useAuth } from '@/app/hooks/useAuth'
import { useTheme } from '@/app/providers/ThemeProvider'
import { 
  HomeIcon, 
  NewspaperIcon, 
  VideoCameraIcon, 
  AcademicCapIcon,
  UserCircleIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isAdmin = user?.role === 'ADMIN'
  const canCreateContent = user?.role === 'ADMIN' || user?.role === 'FORMATOR'

  const navItems = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Articles', href: '/articles', icon: NewspaperIcon },
    { name: 'Vidéos', href: '/videos', icon: VideoCameraIcon },
    { name: 'Formations', href: '/formations', icon: AcademicCapIcon },
    ...(canCreateContent ? [{ name: 'Mon Contenu', href: '/create-content', icon: PencilSquareIcon }] : []),
    ...(isAdmin ? [{ name: 'Administration', href: '/admin', icon: Cog6ToothIcon }] : []),
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="flex items-center space-x-2 font-bold text-2xl text-primary"
          >
            <AcademicCapIcon className="h-8 w-8" />
            <span>KnowLedger</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 relative group py-2 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span>{user?.name}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-secondary"
                      >
                        Mon profil
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 