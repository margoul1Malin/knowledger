import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import MobileUnavailable from '@/app/components/ui/MobileUnavailable'

export default async function CreateContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || ![UserRole.ADMIN, UserRole.FORMATOR].includes(session.user.role as UserRole)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileUnavailable 
        title="Création de contenu indisponible sur mobile"
        message="La création et l'édition de contenu ne sont pas accessibles sur téléphone. Veuillez vous connecter sur un ordinateur pour créer ou modifier vos contenus."
      />

      <div className="hidden lg:block">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  )
} 