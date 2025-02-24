import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import UsersList from '@/app/components/admin/UsersList'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h1>
      </div>
      
      <UsersList users={users} />
    </div>
  )
} 