import prisma from '@/lib/prisma'
import FormationsList from '@/app/components/formations/FormationsList'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function FormationsPage({
  searchParams
}: {
  searchParams: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  const page = parseInt(searchParams.page || '1')
  const limit = 15
  const skip = (page - 1) * limit

  // Récupérer le nombre total de formations
  const totalFormations = await prisma.formation.count()

  // Récupérer les formations avec pagination
  const formations = await prisma.formation.findMany({
    skip,
    take: limit,
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      },
      ratings: true,
      _count: {
        select: {
          ratings: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Si l'utilisateur est connecté, récupérer ses achats
  let userPurchases: { itemId: string }[] = []
  if (session?.user?.email) {
    userPurchases = await prisma.purchase.findMany({
      where: {
        user: {
          email: session.user.email
        },
        type: 'formation'
      },
      select: {
        itemId: true
      }
    })
  }

  // Enrichir les formations avec les informations d'achat et les notes moyennes
  const enrichedFormations = formations.map(formation => {
    const ratings = formation.ratings || []
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0

    return {
      ...formation,
      ratings: undefined, // On ne veut pas envoyer toutes les notes au client
      averageRating,
      totalRatings: formation._count.ratings,
      hasPurchased: userPurchases.some(p => p.itemId === formation.id)
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
            Développez vos compétences avec nos formations complètes
          </p>
        </div>

        <FormationsList 
          initialFormations={enrichedFormations}
          pagination={{
            total: totalFormations,
            pages: Math.ceil(totalFormations / limit),
            page,
            limit
          }}
        />
      </div>
    </div>
  )
} 