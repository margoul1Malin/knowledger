import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

async function ensureDirectoryExists(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    // Créer les dossiers d'upload s'ils n'existent pas
    const publicDir = path.join(process.cwd(), 'public')
    const imagesDir = path.join(publicDir, 'images')
    const videosDir = path.join(publicDir, 'videos')

    await ensureDirectoryExists(publicDir)
    await ensureDirectoryExists(imagesDir)
    await ensureDirectoryExists(videosDir)

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.name)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`
    const uploadDir = path.join(process.cwd(), 'public', type === 'image' ? 'images' : 'videos')
    const filePath = path.join(uploadDir, fileName)

    // Convertir le fichier en buffer et l'écrire
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    return NextResponse.json({ 
      url: `/${type === 'image' ? 'images' : 'videos'}/${fileName}` 
    })
  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
} 