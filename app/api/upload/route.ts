import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

// Formats de fichiers autorisés
const ALLOWED_FORMATS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo'
]

// Taille maximale de fichier (500MB pour les vidéos, 5MB pour les autres)
const MAX_FILE_SIZE = {
  video: 500 * 1024 * 1024,
  other: 5 * 1024 * 1024
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as Blob
    const type = formData.get('type') as string || 'other' // 'video' ou 'other'

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    console.log('Type de fichier reçu:', file.type)
    console.log('Taille du fichier:', file.size)

    // Vérifier le type de fichier
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format de fichier non autorisé. Formats acceptés : PDF, DOCX, JPG, PNG, MP4, MOV, AVI' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier
    const maxSize = type === 'video' ? MAX_FILE_SIZE.video : MAX_FILE_SIZE.other
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Le fichier est trop volumineux. Taille maximale : ${type === 'video' ? '500MB' : '5MB'}` },
        { status: 400 }
      )
    }

    // Créer le dossier d'upload s'il n'existe pas
    const rootDir = process.cwd()
    const publicDir = path.join(rootDir, 'public')
    const uploadsDir = path.join(publicDir, 'uploads')
    
    // Déterminer le dossier de destination en fonction du type
    let destinationDir
    if (file.type.startsWith('video/')) {
      destinationDir = path.join(uploadsDir, 'videos')
    } else if (file.type.startsWith('image/')) {
      destinationDir = path.join(uploadsDir, 'images')
    } else {
      destinationDir = path.join(uploadsDir, 'documents')
    }

    // Créer les dossiers de manière récursive
    if (!fs.existsSync(destinationDir)) {
      await mkdir(destinationDir, { recursive: true })
      console.log('Dossiers créés:', destinationDir)
    }

    // Générer un nom de fichier unique avec la bonne extension
    const fileExtension = file.type === 'video/mp4' ? '.mp4' :
                         file.type === 'video/quicktime' ? '.mov' :
                         file.type === 'video/x-msvideo' ? '.avi' :
                         file.type === 'application/pdf' ? '.pdf' :
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? '.docx' :
                         file.type === 'image/jpeg' ? '.jpg' :
                         '.png'
    
    const fileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(destinationDir, fileName)

    console.log('Chemin complet du fichier:', filePath)

    try {
      // Convertir le fichier en buffer et l'écrire
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)
      console.log('Fichier écrit avec succès')

      // Vérifier que le fichier existe
      if (fs.existsSync(filePath)) {
        console.log('Fichier vérifié - existe bien sur le disque')
        // Retourner l'URL publique du fichier
        const fileUrl = `/uploads/${file.type.startsWith('video/') ? 'videos' : 
                                  file.type.startsWith('image/') ? 'images' : 
                                  'documents'}/${fileName}`
        console.log('URL du fichier:', fileUrl)
        
        return NextResponse.json({ url: fileUrl })
      } else {
        throw new Error('Le fichier n\'a pas été créé correctement')
      }
    } catch (error) {
      console.error('Erreur lors de l\'écriture du fichier:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'écriture du fichier' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    )
  }
}

// Configuration pour augmenter la limite de taille des fichiers
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '500mb'
  }
} 