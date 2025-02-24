import Link from 'next/link'
import { NewspaperIcon, VideoCameraIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

const contentTypes = [
  {
    title: 'Article',
    description: 'Créez un article pour partager vos connaissances',
    icon: NewspaperIcon,
    href: '/create-content/article'
  },
  {
    title: 'Vidéo',
    description: 'Publiez une vidéo éducative',
    icon: VideoCameraIcon,
    href: '/create-content/video'
  },
  {
    title: 'Formation',
    description: 'Créez une formation complète',
    icon: AcademicCapIcon,
    href: '/create-content/formation'
  }
]

export default function CreateContent() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Créer du contenu
          </h1>
          <p className="text-muted-foreground">
            Choisissez le type de contenu que vous souhaitez créer
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contentTypes.map((type) => {
            const Icon = type.icon
            return (
              <Link
                key={type.href}
                href={type.href}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-colors group"
              >
                <Icon className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {type.title}
                </h2>
                <p className="text-muted-foreground">
                  {type.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
} 