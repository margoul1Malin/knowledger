import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import FormationContent from './FormationContent'

async function getFormation(slug: string) {
  const formation = await prisma.formation.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      videos: {
        include: {
          video: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  })

  if (!formation) notFound()
  return formation
}

export default async function FormationPage({
  params
}: {
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions)
  const formation = await getFormation(params.slug)

  return <FormationContent formation={formation} session={session} />
} 