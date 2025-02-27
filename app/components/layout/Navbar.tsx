'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  PencilSquareIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

const SearchDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      onClose()
      setQuery('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 p-4"
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des articles, vidéos, formations..."
                className="w-full px-4 py-3 pl-12 bg-card border border-border rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isAdmin = user?.role === 'ADMIN'
  const canCreateContent = user?.role === 'ADMIN' || user?.role === 'FORMATOR'
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const navItems = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Articles', href: '/articles', icon: NewspaperIcon },
    { name: 'Vidéos', href: '/videos', icon: VideoCameraIcon },
    { name: 'Formations', href: '/formations', icon: AcademicCapIcon },
    { name: 'Formateurs', href: '/publicprofiles', icon: UserGroupIcon },
    ...(user?.role === 'NORMAL' ? [{ name: 'Premium', href: '/premium', icon: SparklesIcon }] : []),
    ...(canCreateContent ? [{ name: 'Mon Contenu', href: '/create-content', icon: PencilSquareIcon }] : []),
    ...(isAdmin ? [{ name: 'Administration', href: '/admin', icon: Cog6ToothIcon }] : []),
  ]

  const showPremiumLink = isAuthenticated && user?.role === 'NORMAL'

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
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link 
            href="/" 
            className="flex items-center space-x-2 font-bold text-2xl text-primary"
          >
            <AcademicCapIcon className="h-8 w-8" />
            <span>KnowLedger</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 relative group py-3 px-3 rounded-lg hover:bg-secondary/50 ${
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

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-secondary"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

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

            {showPremiumLink && (
              <Link
                href="/premium"
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <SparklesIcon className="h-5 w-5" />
                <span className="font-medium">Devenir Premium</span>
              </Link>
            )}

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
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  )
}

export default Navbar 