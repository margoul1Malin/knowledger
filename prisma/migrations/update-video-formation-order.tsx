import { PrismaClient, VideoFormation } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer toutes les formations
  const formations = await prisma.formation.findMany({
    include: {
      videos: true
    }
  })

  // Pour chaque formation, mettre à jour les orderId des vidéos
  for (const formation of formations) {
    const sortedVideos = formation.videos.sort((a, b) => a.order - b.order)
    
    // Mettre à jour chaque vidéo avec un nouvel orderId
    for (let i = 0; i < sortedVideos.length; i++) {
      const videoFormation = sortedVideos[i] as VideoFormation
      await prisma.videoFormation.updateMany({
        where: {
          id: videoFormation.id
        },
        data: {
          order: i + 1 // Utiliser order au lieu de orderId pour le moment
        }
      })
    }
  }

  console.log('Migration terminée avec succès')
}

main()
  .catch((e) => {
    console.error('Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 