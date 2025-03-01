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
  'image/png'
]

// Taille maximale de fichier (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as Blob

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
        { error: 'Format de fichier non autorisé. Formats acceptés : PDF, DOCX, JPG, PNG' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Taille maximale : 5MB' },
        { status: 400 }
      )
    }

    // Créer le dossier d'upload s'il n'existe pas
    const rootDir = process.cwd()
    console.log('Répertoire racine:', rootDir)

    const publicDir = path.join(rootDir, 'public')
    const uploadsDir = path.join(publicDir, 'uploads')
    const formatorDir = path.join(uploadsDir, 'formator')

    console.log('Structure des dossiers:')
    console.log('- Public:', publicDir)
    console.log('- Uploads:', uploadsDir)
    console.log('- Formator:', formatorDir)

    // Créer les dossiers de manière récursive
    if (!fs.existsSync(formatorDir)) {
      await mkdir(formatorDir, { recursive: true })
      console.log('Dossiers créés')
    }

    // Générer un nom de fichier unique avec la bonne extension
    const fileExtension = file.type === 'application/pdf' ? '.pdf' :
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? '.docx' :
                         file.type === 'image/jpeg' ? '.jpg' :
                         '.png'
    
    const fileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(formatorDir, fileName)

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
        const fileUrl = `/uploads/formator/${fileName}`
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
    bodyParser: false
  }
} 