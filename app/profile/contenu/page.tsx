import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import CreatorContent from '@/app/components/profile/CreatorContent'
import MobileUnavailable from '@/app/components/ui/MobileUnavailable'

export default async function ContenuPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || ![UserRole.ADMIN, UserRole.FORMATOR].includes(session.user.role as UserRole)) {
    redirect('/profile')
  }

  return (
    <>
      <MobileUnavailable 
        title="Gestion du contenu indisponible sur mobile"
        message="La gestion de votre contenu n'est pas accessible sur téléphone. Veuillez vous connecter sur un ordinateur pour gérer vos articles, vidéos et formations."
      />

      <div className="hidden lg:block max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mon contenu</h1>
        <CreatorContent />
      </div>
    </>
  )
} 