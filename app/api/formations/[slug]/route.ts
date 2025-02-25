export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return new NextResponse(
        JSON.stringify({ error: 'Non autorisé' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const formation = await prisma.formation.findUnique({
      where: { slug: params.slug }
    })

    if (!formation) {
      return new NextResponse(
        JSON.stringify({ error: 'Formation non trouvée' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Supprimer d'abord les relations VideoFormation
    await prisma.videoFormation.deleteMany({
      where: { formationId: formation.id }
    })

    // Supprimer les achats liés
    await prisma.purchase.deleteMany({
      where: { 
        contentId: formation.id,
        type: 'formation'
      }
    })

    // Supprimer la formation
    await prisma.formation.delete({
      where: { id: formation.id }
    })

    return new NextResponse(
      JSON.stringify({ 
        message: 'Formation supprimée avec succès',
        success: true 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Erreur lors de la suppression',
        success: false
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 