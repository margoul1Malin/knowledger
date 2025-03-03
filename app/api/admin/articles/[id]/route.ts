import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary-config'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'article pour avoir le publicId de l'image
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      select: {
        imagePublicId: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }

    // Supprimer l'image de Cloudinary si elle existe
    if (article.imagePublicId) {
      try {
        console.log('Suppression de l\'image Cloudinary:', article.imagePublicId)
        await cloudinary.uploader.destroy(article.imagePublicId, {
          resource_type: 'image'
        })
      } catch (cloudinaryError) {
        console.error('Erreur lors de la suppression Cloudinary:', cloudinaryError)
        // On continue même si la suppression Cloudinary échoue
      }
    }

    // Supprimer les achats
    await prisma.purchase.deleteMany({
      where: { 
        itemId: params.id,
        type: 'article'
      }
    })

    // Supprimer l'article
    await prisma.article.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
} 