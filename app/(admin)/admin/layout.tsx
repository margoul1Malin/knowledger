import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/app/components/admin/AdminSidebar'
import MobileUnavailable from '@/app/components/ui/MobileUnavailable'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileUnavailable 
        title="Administration indisponible sur mobile"
        message="L'interface d'administration n'est pas accessible sur téléphone. Veuillez vous connecter sur un ordinateur pour gérer le site."
      />

      <div className="hidden lg:flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 