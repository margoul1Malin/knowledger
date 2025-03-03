import { DocumentIcon, VideoCameraIcon, AcademicCapIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"

interface ContentCardProps {
  type: 'article' | 'video' | 'formation'
  title: string
  description: string
  image: string
  href: string
  createdAt: Date
}

const typeIcons = {
  article: DocumentIcon,
  video: VideoCameraIcon,
  formation: AcademicCapIcon
}

const typeColors = {
  article: 'from-blue-500 to-blue-700',
  video: 'from-red-500 to-red-700',
  formation: 'from-green-500 to-green-700'
}

export default function ContentCard({ type, title, description, image, href, createdAt }: ContentCardProps) {
  const Icon = typeIcons[type]
  const gradientColor = typeColors[type]

  return (
    <Link 
      href={href}
      className="group relative block w-full overflow-hidden rounded-xl bg-card transition-all hover:shadow-lg"
    >
      <div className="aspect-[16/9] w-full relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-20 group-hover:opacity-30 transition-opacity z-10`} />
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 z-20">
          <div className="rounded-full bg-background/90 p-2 backdrop-blur-sm">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
        
        <h3 className="mb-2 text-xl font-semibold line-clamp-1 text-foreground">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  )
} 