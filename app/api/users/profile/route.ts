import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import bcrypt from 'bcryptjs'
import { existsSync } from 'fs'

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
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Vérifier et créer le dossier si nécessaire
      const uploadDir = join(process.cwd(), 'public', 'profile-pictures')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      // Générer un nom de fichier unique avec l'extension
      const fileExtension = image.name.split('.').pop()
      const fileName = `${session.user.id}-${Date.now()}.${fileExtension}`
      const filePath = join(uploadDir, fileName)
      
      // Sauvegarder l'image
      await writeFile(filePath, buffer)
      
      // Mettre à jour le chemin dans la base de données
      // Utiliser un chemin relatif pour l'accès via l'API Next.js
      updateData.image = `/profile-pictures/${fileName}`
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