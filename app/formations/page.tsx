import prisma from '@/lib/prisma'
import FormationsList from '@/app/components/formations/FormationsList'

export default async function Formations() {
  const formations = await prisma.formation.findMany({
    include: {
      author: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Formations
          </h1>
          <p className="text-muted-foreground">
            Des parcours complets pour maîtriser votre domaine
          </p>
        </div>

        <FormationsList formations={formations} />
      </div>
    </div>
  )
} 