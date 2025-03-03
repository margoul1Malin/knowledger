import Image from 'next/image'
import Link from 'next/link'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import prisma from '@/lib/prisma'

async function getParcours() {
  const parcours = await prisma.parcours.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      formations: {
        include: {
          formation: true
        }
      }
    }
  })

  return parcours
}

export default async function ParcoursPage() {
  const parcours = await getParcours()

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Parcours d'Apprentissage
          </h1>
          <p className="text-lg text-muted-foreground">
            Explorez nos parcours thématiques pour une progression structurée dans votre apprentissage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {parcours.map((parcours) => (
            <Link
              key={parcours.id}
              href={`/parcours/${parcours.slug}`}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary transition-colors duration-300"
            >
              {/* Image avec overlay */}
              <div className="relative aspect-video">
                <Image
                  src={parcours.imageUrl}
                  alt={parcours.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Contenu */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {parcours.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2">
                  {parcours.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(new Date(parcours.createdAt), 'dd/MM/yyyy')}
                  </div>
                  <div>
                    {parcours.formations.length} formation{parcours.formations.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 