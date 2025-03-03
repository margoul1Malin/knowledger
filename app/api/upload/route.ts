import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary-config'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const resourceType = formData.get('resourceType') as 'image' | 'video'

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier requis' },
        { status: 400 }
      )
    }

    if (!['image', 'video'].includes(resourceType)) {
      return NextResponse.json(
        { error: 'Type de ressource invalide' },
        { status: 400 }
      )
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'knowledger',
          resource_type: resourceType
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      // Écrire le buffer dans le stream
      uploadStream.end(buffer)
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[UPLOAD]', error)
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
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