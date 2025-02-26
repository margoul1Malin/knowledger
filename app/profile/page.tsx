import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import UserInfo from '@/components/profile/UserInfo'
import PurchaseHistory from '@/components/profile/PurchaseHistory'
import HistorySection from '@/components/profile/HistorySection'
import CreatorContent from '@/components/profile/CreatorContent'
import { UserRole } from '@prisma/client'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const isCreator = session.user.role === UserRole.FORMATOR || session.user.role === UserRole.ADMIN

  return (
    <div className="container py-8 space-y-8">
      <UserInfo />

      {isCreator && (
        <>
          <h2 className="text-2xl font-semibold">Mon contenu</h2>
          <CreatorContent />
        </>
      )}

      <h2 className="text-2xl font-semibold">Mes achats</h2>
      <PurchaseHistory />

      <h2 className="text-2xl font-semibold">Mon historique</h2>
      <HistorySection />
    </div>
  )
} 