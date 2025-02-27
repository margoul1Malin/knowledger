import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import CreatorContent from '@/app/components/profile/CreatorContent'

export default async function ContenuPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || ![UserRole.ADMIN, UserRole.FORMATOR].includes(session.user.role as UserRole)) {
    redirect('/profile')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mon contenu</h1>
      <CreatorContent />
    </div>
  )
} 