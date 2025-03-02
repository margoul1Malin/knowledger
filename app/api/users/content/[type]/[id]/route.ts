import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { type, id } = params

    // Vérifier que l'utilisateur est bien l'auteur du contenu
    let content
    switch (type) {
      case 'article':
        content = await prisma.article.findUnique({
          where: { id }
        })
        break
      case 'video':
        content = await prisma.video.findUnique({
          where: { id }
        })
        break
      case 'formation':
        content = await prisma.formation.findUnique({
          where: { id }
        })
        break
      default:
        return NextResponse.json(
          { error: 'Type de contenu invalide' },
          { status: 400 }
        )
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Contenu non trouvé' },
        { status: 404 }
      )
    }

    if (content.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Supprimer le contenu
    switch (type) {
      case 'article':
        await prisma.article.delete({
          where: { id }
        })
        break
      case 'video':
        // Supprimer d'abord les relations avec les formations
        await prisma.videoFormation.deleteMany({
          where: { videoId: id }
        })
        await prisma.video.delete({
          where: { id }
        })
        break
      case 'formation':
        // Supprimer d'abord les relations avec les vidéos
        await prisma.videoFormation.deleteMany({
          where: { formationId: id }
        })
        await prisma.formation.delete({
          where: { id }
        })
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'FORMATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { type, id } = params
    const data = await req.json()

    // Vérifier que l'utilisateur est bien l'auteur du contenu
    let content
    switch (type) {
      case 'article':
        content = await prisma.article.findUnique({
          where: { id }
        })
        break
      case 'video':
        content = await prisma.video.findUnique({
          where: { id }
        })
        break
      case 'formation':
        content = await prisma.formation.findUnique({
          where: { id }
        })
        break
      default:
        return NextResponse.json(
          { error: 'Type de contenu invalide' },
          { status: 400 }
        )
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Contenu non trouvé' },
        { status: 404 }
      )
    }

    if (content.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Mettre à jour le contenu
    switch (type) {
      case 'article':
        await prisma.article.update({
          where: { id },
          data: {
            title: data.title,
            content: data.content,
            imageUrl: data.imageUrl,
            isPremium: data.isPremium,
            price: data.price,
            categoryId: data.categoryId
          }
        })
        break
      case 'video':
        await prisma.video.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            videoUrl: data.videoUrl,
            coverImage: data.coverImage,
            isPremium: data.isPremium,
            price: data.price,
            duration: data.duration,
            categoryId: data.categoryId
          }
        })
        break
      case 'formation':
        await prisma.formation.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            content: data.content,
            imageUrl: data.imageUrl,
            isPremium: data.isPremium,
            price: data.price,
            duration: data.duration,
            categoryId: data.categoryId
          }
        })
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la modification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
} 