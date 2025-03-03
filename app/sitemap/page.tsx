'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/app/hooks/useAuth'

interface SitemapSection {
  title: string
  links: {
    href: string
    label: string
    roles?: string[]  // Rôles autorisés à voir ce lien
  }[]
}

const sitemapData: SitemapSection[] = [
  {
    title: 'Contenu',
    links: [
      { href: '/articles', label: 'Articles' },
      { href: '/videos', label: 'Vidéos' },
      { href: '/formations', label: 'Formations' },
      { href: '/search', label: 'Recherche' }
    ]
  },
  {
    title: 'Compte',
    links: [
      { href: '/login', label: 'Connexion' },
      { href: '/register', label: 'Inscription' },
      { href: '/profile', label: 'Profil' },
      { href: '/profile/historique', label: 'Historique', roles: ['ADMIN', 'FORMATOR', 'PREMIUM'] }
    ]
  },
  {
    title: 'Création',
    links: [
      { 
        href: '/create-content/article', 
        label: 'Créer un article',
        roles: ['ADMIN', 'FORMATOR']
      },
      { 
        href: '/create-content/video', 
        label: 'Créer une vidéo',
        roles: ['ADMIN', 'FORMATOR']
      },
      { 
        href: '/create-content/formation', 
        label: 'Créer une formation',
        roles: ['ADMIN', 'FORMATOR']
      },
      { href: '/formatorquery', label: 'Devenir formateur' }
    ]
  },
  {
    title: 'Informations',
    links: [
      { href: '/about', label: 'À propos' },
      { href: '/legal/terms', label: 'Conditions d\'utilisation' },
      { href: '/legal/privacy', label: 'Politique de confidentialité' },
      { href: '/legal/cookies', label: 'Politique des cookies' }
    ]
  },
  {
    title: 'Contributions',
    links: [
      { href: '/contributions', label: 'Mes contributions' }
    ]
  }
]

const TreeNode = ({ section, index }: { section: SitemapSection; index: number }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // Filtrer les liens en fonction du rôle de l'utilisateur
  const filteredLinks = section.links.filter(link => {
    if (!link.roles) return true // Si pas de rôles spécifiés, montrer à tous
    return link.roles.includes(user?.role || '')
  })

  // Ne pas afficher la section si elle n'a pas de liens visibles
  if (filteredLinks.length === 0) return null

  return (
    <div className="flex flex-col items-center">
      {/* Ligne verticale vers le haut */}
      {index !== 0 && (
        <div className="w-px h-8 bg-primary/30" />
      )}

      {/* Point interactif */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-6 h-6 rounded-full border-2 transition-colors duration-300 flex items-center justify-center
          ${isOpen ? 'bg-primary border-primary' : 'border-primary/50 hover:border-primary'}`}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className={`text-xs font-bold ${isOpen ? 'text-primary-foreground' : 'text-primary'}`}>
          {index + 1}
        </span>
      </motion.button>

      {/* Titre de la section */}
      <h2 className="mt-2 text-xl font-bold text-center">{section.title}</h2>

      {/* Contenu déployable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 grid gap-4 w-full max-w-xl"
          >
            {filteredLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="p-4 rounded-lg border border-input bg-card hover:bg-accent hover:text-accent-foreground
                    transition-colors duration-300 block w-full text-center shadow-sm hover:shadow-md"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ligne verticale vers le bas */}
      <div className="w-px h-8 bg-primary/30" />
    </div>
  )
}

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
        >
          Plan du site
        </motion.h1>

        <div className="max-w-3xl mx-auto">
          {sitemapData.map((section, index) => (
            <TreeNode key={section.title} section={section} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
} 