import { Metadata } from 'next'
import PublicProfilesList from './PublicProfilesList'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Nos Formateurs | KnowLedger',
  description: 'Découvrez nos formateurs experts et professionnels'
}

export default async function PublicProfilesPage() {
  const profiles = await prisma.user.findMany({
    where: {
      role: { in: ['FORMATOR', 'ADMIN'] }
    },
    include: {
      publicProfile: true,
      _count: {
        select: {
          articles: true,
          videos: true,
          formations: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Nos Formateurs Experts
          </h1>
          <p className="text-muted-foreground text-lg">
            Découvrez nos formateurs passionnés et leurs contenus de qualité
          </p>
        </div>

        <PublicProfilesList profiles={profiles} />
      </div>
    </div>
  )
}
