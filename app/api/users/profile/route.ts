import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary-config'
import bcrypt from 'bcryptjs'

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await req.formData()
    const name = formData.get('name') as string
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const image = formData.get('image') as File | null

    let updateData: any = {}

    // Validation du nom
    if (name && name.trim() !== '') {
      if (name.length < 2) {
        return NextResponse.json(
          { error: 'Le nom doit contenir au moins 2 caractères' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    // Gestion de l'image de profil
    if (image) {
      // Récupérer l'ancienne image pour la supprimer de Cloudinary
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { imagePublicId: true }
      })

      // Supprimer l'ancienne image de Cloudinary si elle existe
      if (user?.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(user.imagePublicId)
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'ancienne image:', error)
        }
      }

      // Convertir le fichier en buffer
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload vers Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'knowledger/profile-pictures',
            resource_type: 'image',
            transformation: [
              { width: 200, height: 200, crop: 'fill' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      if (!uploadResponse) {
        throw new Error('Erreur lors de l\'upload de l\'image')
      }

      const { secure_url, public_id } = uploadResponse as any
      updateData.image = secure_url
      updateData.imagePublicId = public_id
    }

    // Mise à jour du mot de passe
    if (currentPassword && newPassword) {
      // Vérification de la longueur du nouveau mot de passe
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      })

      if (!user?.password) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        )
      }

      // Vérification du mot de passe actuel
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        )
      }

      // Hashage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updateData.password = hashedPassword
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
} 