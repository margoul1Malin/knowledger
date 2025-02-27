import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProfileHeader from './ProfileHeader'
import ContentTabs from './ContentTabs'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const profile = await prisma.user.findUnique({
    where: { id: params.id },
    include: { publicProfile: true }
  })

  if (!profile) return { title: 'Profil non trouvé' }

  return {
    title: `${profile.name} | KnowLedger`,
    description: profile.publicProfile?.bio?.slice(0, 160) || `Profil de ${profile.name}`
  }
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const profile = await prisma.user.findUnique({
    where: {
      id: params.id,
      role: { in: ['FORMATOR', 'ADMIN'] }
    },
    include: {
      publicProfile: true,
      articles: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
              image: true
            }
          }
        }
      },
      videos: {
        where: {
          formations: { none: {} }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
              image: true
            }
          }
        }
      },
      formations: {
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    }
  })

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <ProfileHeader profile={profile} />
      <ContentTabs profile={profile} />
    </div>
  )
}
