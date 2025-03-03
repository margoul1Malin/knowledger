import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary-config'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { publicId, resourceType = 'image' } = await req.json()

    if (!publicId) {
      return NextResponse.json(
        { error: 'ID public requis' },
        { status: 400 }
      )
    }

    console.log('Suppression Cloudinary:', { publicId, resourceType })

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      })
      console.log('Résultat suppression Cloudinary:', result)

      if (result.result !== 'ok') {
        throw new Error(`Échec de la suppression: ${result.result}`)
      }
    } catch (cloudinaryError) {
      console.error('Erreur Cloudinary:', cloudinaryError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression Cloudinary' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[UPLOAD_DELETE]', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
} 