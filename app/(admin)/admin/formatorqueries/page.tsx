import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StatusChanger from '@/components/admin/formatorqueries/StatusChanger'
import DeleteFormatorQuery from '@/components/admin/formatorqueries/DeleteFormatorQuery'
import ResponseDialog from '@/components/admin/formatorqueries/ResponseDialog'

export default async function FormatorQueriesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const queries = await prisma.formatorQuery.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Demandes de formateur</h1>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="py-3 px-4 text-left">Nom</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Compétences</th>
                <th className="py-3 px-4 text-left">Statut</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query) => (
                <tr key={query.id} className="border-b">
                  <td className="py-3 px-4">
                    {query.firstName} {query.lastName}
                  </td>
                  <td className="py-3 px-4">{query.email}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {query.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusChanger
                      id={query.id}
                      currentStatus={query.status}
                      email={query.email}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <ResponseDialog
                        id={query.id}
                        email={query.email}
                        firstName={query.firstName}
                        lastName={query.lastName}
                        currentStatus={query.status}
                      />
                      <Link href={`/admin/formatorqueries/${query.id}`}>
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                      </Link>
                      <DeleteFormatorQuery id={query.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 