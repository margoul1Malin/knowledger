'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TreeNode {
  title: string
  progress: number
  isValidated?: boolean
  links?: {
    href: string
    label: string
    roles?: string[]
    progress: number
  }[]
  children?: TreeNode[]
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
  const [isOpen, setIsOpen] = useState(level < 1)

  const filteredLinks = node.links?.filter(link => {
    if (!link.roles) return true
    return link.roles.includes(userRole || '')
  }) || []

  const hasContent = (filteredLinks.length > 0) || (node.children && node.children.length > 0)
  if (!hasContent) return null

  const hasValidAccess = !node.links?.[0]?.roles || node.links[0].roles.includes(userRole || '')

  return (
    <div className={cn(
      "relative flex flex-col items-center",
      level > 0 && "ml-6",
      level > 0 && "before:absolute before:top-0 before:bottom-0 before:left-[-24px] before:w-px before:bg-primary/30"
    )}>
      {/* Point interactif avec progression */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-6 h-6 rounded-full border-2 transition-colors duration-300 flex items-center justify-center relative z-10 bg-background
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
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "truncate",
                level === 0 && "text-5xl font-bold",
                level === 1 && "text-2xl font-semibold",
                level === 2 && "text-base font-medium"
              )}>
                {node.title}
              </span>
              {node.isValidated && (
                <span className="text-green-500">✓</span>
              )}
            </div>
            {node.links && node.links.map((link, index) => (
              hasValidAccess ? (
                <Link
                  key={index}
                  href={link.href}
                  className={cn(
                    "text-sm text-muted-foreground hover:text-primary transition-colors",
                    !hasValidAccess && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {link.label}
                </Link>
              ) : (
                <span
                  key={index}
                  className="text-sm text-muted-foreground opacity-50 cursor-not-allowed"
                >
                  {link.label} (Premium)
                </span>
              )
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  node.isValidated
                    ? "bg-green-500"
                    : "bg-primary"
                )}
                style={{ width: `${node.progress}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-9">
              {Math.round(node.progress)}%
            </span>
          </div>
        </div>
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
                    {node.isValidated ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-sm text-muted-foreground">({Math.round(link.progress)}%)</span>
                    )}
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