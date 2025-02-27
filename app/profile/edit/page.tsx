import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import EditProfileForm from './EditProfileForm'
import prisma from '@/lib/prisma'

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
    redirect('/')
  }

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { publicProfile: true }
  })

  if (!profile) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Éditer mon profil public</h1>
          <EditProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
