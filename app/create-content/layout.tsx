import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import AccessDenied from '@/app/components/error/AccessDenied'

export default async function CreateContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  if (!['ADMIN', 'FORMATOR'].includes(session.user.role)) {
    return <AccessDenied />
  }

  return children
} 