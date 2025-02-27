import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ProfileSidebar from '@/app/components/profile/ProfileSidebar'

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <ProfileSidebar />
        <main className="flex-1 p-8 pt-24 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
} 