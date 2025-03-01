import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import TwoFactorSettings from '@/app/components/profile/TwoFactorSettings'

export default async function SecurityPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      twoFactorEnabled: true,
      twoFactorMethod: true,
      phoneNumber: true
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">Sécurité</h1>
      
      <div className="bg-card border border-border rounded-xl p-6">
        <TwoFactorSettings user={user} />
      </div>
    </div>
  )
} 