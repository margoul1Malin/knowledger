import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import DeleteFormatorQuery from '@/app/components/admin/formatorqueries/DeleteFormatorQuery'
import StatusChanger from '@/app/components/admin/formatorqueries/StatusChanger'

interface FormatorQuery {
  id: string
  firstName: string
  lastName: string
  email: string
  skills: string[]
  wantArticles: boolean
  wantVideos: boolean
  wantFormations: boolean
  status: string
  createdAt: Date
}

async function getFormatorQueries(): Promise<FormatorQuery[]> {
  const queries = await prisma.formatorQuery.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
  return queries
}

export default async function FormatorQueriesPage() {
  const queries = await getFormatorQueries()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Demandes Formateur</h1>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium">Nom</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Compétences</th>
                <th className="text-left p-4 font-medium">Types de contenu</th>
                <th className="text-left p-4 font-medium">Statut</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query: FormatorQuery) => (
                <tr key={query.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-4">
                    {query.firstName} {query.lastName}
                  </td>
                  <td className="p-4">{query.email}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {query.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {query.wantArticles && <Badge>Articles</Badge>}
                      {query.wantVideos && <Badge>Vidéos</Badge>}
                      {query.wantFormations && <Badge>Formations</Badge>}
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusChanger 
                      id={query.id} 
                      currentStatus={query.status}
                      email={query.email}
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {formatDistanceToNow(new Date(query.createdAt), { 
                      addSuffix: true,
                      locale: fr 
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/formatorqueries/${query.id}`}>
                        <Button size="sm" variant="ghost">
                          <EyeIcon className="h-4 w-4" />
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