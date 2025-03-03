'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

export interface TreeNode {
  title: string
  links?: {
    href: string
    label: string
    roles?: string[]
    progress?: number // 0-100
  }[]
  children?: TreeNode[]
  progress?: number // 0-100
}

interface TreeViewProps {
  data: TreeNode[]
  userRole?: string
  className?: string
}

interface TreeNodeComponentProps {
  node: TreeNode
  index: number
  level?: number
  userRole?: string
}

const TreeNodeComponent = ({ node, index, level = 0, userRole }: TreeNodeComponentProps) => {
  const [isOpen, setIsOpen] = useState(level < 1) // Déplié par défaut pour les niveaux 0 et 1

  // Filtrer les liens en fonction du rôle de l'utilisateur
  const filteredLinks = node.links?.filter(link => {
    if (!link.roles) return true
    return link.roles.includes(userRole || '')
  }) || []

  // Vérifier si le nœud a du contenu à afficher
  const hasContent = (filteredLinks.length > 0) || (node.children && node.children.length > 0)
  if (!hasContent) return null

  return (
    <div className="flex flex-col items-center">
      {/* Ligne verticale vers le haut */}
      {index !== 0 && (
        <div className="w-px h-8 bg-primary/30" />
      )}

      {/* Point interactif avec progression */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-6 h-6 rounded-full border-2 transition-colors duration-300 flex items-center justify-center relative
          ${isOpen ? 'bg-primary border-primary' : 'border-primary/50 hover:border-primary'}`}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className={`text-xs font-bold ${isOpen ? 'text-primary-foreground' : 'text-primary'}`}>
          {level === 0 ? '0' : index + 1}
        </span>
        {node.progress === 100 && (
          <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-2 -right-2" />
        )}
      </motion.button>

      {/* Titre de la section avec progression */}
      <div className="mt-2 text-center">
        <h2 className={`${level === 0 ? 'text-3xl' : 'text-xl'} font-bold`}>{node.title}</h2>
        {node.progress !== undefined && node.progress < 100 && (
          <p className="text-sm text-muted-foreground mt-1">
            Progression : {Math.round(node.progress)}%
          </p>
        )}
      </div>

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
            {/* Liens avec indicateurs de progression */}
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
                    transition-colors duration-300 block w-full text-center shadow-sm hover:shadow-md relative"
                >
                  <span className="flex items-center justify-center gap-2">
                    {link.label}
                    {link.progress === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : link.progress !== undefined ? (
                      <span className="text-sm text-muted-foreground">({Math.round(link.progress)}%)</span>
                    ) : null}
                  </span>
                </Link>
              </motion.div>
            ))}

            {/* Sous-nœuds */}
            {node.children?.map((child, childIndex) => (
              <TreeNodeComponent
                key={child.title}
                node={child}
                index={childIndex}
                level={level + 1}
                userRole={userRole}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ligne verticale vers le bas */}
      <div className="w-px h-8 bg-primary/30" />
    </div>
  )
}

export default function TreeView({ data, userRole, className = '' }: TreeViewProps) {
  return (
    <div className={className}>
      {data.map((node, index) => (
        <TreeNodeComponent
          key={node.title}
          node={node}
          index={index}
          level={0}
          userRole={userRole}
        />
      ))}
    </div>
  )
} 