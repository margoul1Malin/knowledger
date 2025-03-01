import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import DeleteFormatorQuery from '@/app/components/admin/formatorqueries/DeleteFormatorQuery'

async function getFormatorQuery(id: string) {
  const query = await prisma.formatorQuery.findUnique({
    where: { id }
  })
  
  if (!query) notFound()
  return query
}

export default async function FormatorQueryPage({ params }: { params: { id: string } }) {
  const query = await getFormatorQuery(params.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/formatorqueries">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Demande de {query.firstName} {query.lastName}</h1>
        </div>
        <DeleteFormatorQuery id={query.id} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Nom complet</dt>
                <dd className="text-foreground">{query.firstName} {query.lastName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="text-foreground">{query.email}</dd>
              </div>
              {query.phone && (
                <div>
                  <dt className="text-sm text-muted-foreground">Téléphone</dt>
                  <dd className="text-foreground">{query.phone}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">Date de la demande</dt>
                <dd className="text-foreground">
                  {formatDistanceToNow(new Date(query.createdAt), { 
                    addSuffix: true,
                    locale: fr 
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Statut</dt>
                <dd>
                  <Badge 
                    variant={
                      query.status === 'APPROVED' ? 'success' :
                      query.status === 'REJECTED' ? 'destructive' :
                      'default'
                    }
                  >
                    {query.status === 'PENDING' ? 'En attente' :
                     query.status === 'APPROVED' ? 'Approuvé' :
                     'Rejeté'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {query.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Types de contenu souhaités</h2>
            <div className="flex flex-wrap gap-2">
              {query.wantArticles && <Badge>Articles</Badge>}
              {query.wantVideos && <Badge>Vidéos</Badge>}
              {query.wantFormations && <Badge>Formations</Badge>}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Message</h2>
            <p className="text-foreground whitespace-pre-wrap">{query.message}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 