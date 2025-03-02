'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useAuth } from '@/app/hooks/useAuth'
import { useTheme } from '@/app/providers/ThemeProvider'
import Image from 'next/image'
import { 
  Home, 
  Newspaper, 
  Camera, 
  GraduationCap,
  UserCircle,
  ChevronDown,
  Sun,
  Moon,
  Settings,
  PenSquare,
  Sparkles,
  Search,
  Menu,
  X,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SearchDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const query = formData.get('query')?.toString()
    
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-4">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <input
              type="text"
              name="query"
              placeholder="Rechercher..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
            />
            <Button type="submit">Rechercher</Button>
          </form>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  )
}

const Navbar = () => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // Liens de navigation de base
  const baseNavLinks = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/articles', icon: Newspaper, label: 'Articles' },
    { href: '/videos', icon: Camera, label: 'Vidéos' },
    { href: '/formations', icon: GraduationCap, label: 'Formations' },
    { href: '/publicprofiles', icon: Users, label: 'Formateurs' },
  ]

  // Ajouter des liens en fonction du rôle
  const navLinks = [...baseNavLinks]

  if (user?.role === 'NORMAL') {
    navLinks.push({ href: '/premium', icon: Sparkles, label: 'Premium' })
  }

  if (user?.role === 'ADMIN' || user?.role === 'FORMATOR') {
    navLinks.push({ href: '/create-content', icon: PenSquare, label: 'Créer' })
  }

  if (user?.role === 'ADMIN') {
    navLinks.push({ href: '/admin', icon: Settings, label: 'Administration' })
  }

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-background transition-all duration-200',
        isScrolled && 'border-b shadow-sm'
      )}>
        <nav className="container mx-auto p-2">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Toujours visible */}
            <Link href="/" className="text-xl lg:text-4xl font-bold text-primary">
              {/*<Image src="/logos/KBlueSquare.png" alt="Knowledger" width={180} height={80} />*/}
              KnowLedger
            </Link>

            {/* Menu hamburger sur mobile */}
            <button
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Navigation desktop */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center space-x-1 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                    pathname === link.href ? 'bg-accent' : 'transparent'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Actions desktop */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleTheme()}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {user ? (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1"
                  >
                    <UserCircle className="h-5 w-5" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-card border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Mon Profil
                      </Link>
                      {['ADMIN', 'FORMATOR'].includes(user.role || '') && (
                        <Link
                          href="/profile/contenu"
                          className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                        >
                          <PenSquare className="mr-2 h-4 w-4" />
                          Mes Contenus
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-accent"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login">
                  <Button>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Menu mobile */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t">
              <div className="space-y-2 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 text-sm transition-colors hover:bg-accent',
                      pathname === link.href ? 'bg-accent' : 'transparent'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                ))}

                <div className="border-t my-2" />

                <button
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsSearchOpen(true)
                  }}
                >
                  <Search className="h-4 w-4" />
                  <span>Rechercher</span>
                </button>

                <button
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => toggleTheme()}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Thème clair</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Thème sombre</span>
                    </>
                  )}
                </button>

                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Mon Profil</span>
                    </Link>
                    {['ADMIN', 'FORMATOR'].includes(user.role || '') && (
                      <Link
                        href="/profile/contenu"
                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <PenSquare className="h-4 w-4" />
                        <span>Mes Contenus</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-destructive hover:bg-accent"
                    >
                      <span>Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCircle className="h-4 w-4" />
                    <span>Connexion</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Navbar 