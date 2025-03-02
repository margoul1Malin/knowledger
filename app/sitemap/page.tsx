'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface SitemapSection {
  title: string
  links: {
    href: string
    label: string
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
      { href: '/profile/historique', label: 'Historique' }
    ]
  },
  {
    title: 'Création',
    links: [
      { href: '/create-content/article', label: 'Créer un article' },
      { href: '/create-content/video', label: 'Créer une vidéo' },
      { href: '/create-content/formation', label: 'Créer une formation' },
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
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const SitemapSection = ({ section, index }: { section: SitemapSection; index: number }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <motion.div
      variants={sectionVariants}
      className="mb-8"
      style={{ 
        '--delay': `${index * 0.1}s`
      } as any}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-4 group"
      >
        <h2 className="text-2xl font-bold">{section.title}</h2>
        <ChevronDownIcon 
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="p-4 rounded-lg border border-input hover:border-primary transition-colors duration-300 group"
            >
              <span className="text-foreground group-hover:text-primary transition-colors duration-300">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-5xl mx-auto"
        >
          <motion.h1 
            variants={sectionVariants}
            className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
          >
            Plan du site
          </motion.h1>

          {sitemapData.map((section, index) => (
            <SitemapSection key={section.title} section={section} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  )
} 