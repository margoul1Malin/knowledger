export interface UploadResult {
  url: string
  publicId: string
  resourceType: string
}

// Options par défaut pour les images
const defaultImageOptions = {
  folder: 'knowledger/images',
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' }
  ],
  allowed_formats: ['jpg', 'png', 'gif', 'webp'],
  max_bytes: 5 * 1024 * 1024 // 5MB
}

// Options par défaut pour les vidéos
const defaultVideoOptions = {
  folder: 'knowledger/videos',
  resource_type: 'video',
  eager: [
    { format: 'mp4', quality: 'auto:good' }
  ],
  eager_async: true,
  allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
  max_bytes: 100 * 1024 * 1024 // 100MB
}

export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('resourceType', 'image')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement de l\'image')
    }

    const data = await response.json()

    return {
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: 'image'
    }
  } catch (error) {
    console.error('Erreur uploadImage:', error)
    throw error
  }
}

export async function uploadVideo(file: File): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('resourceType', 'video')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement de la vidéo')
    }

    const data = await response.json()

    return {
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: 'video'
    }
  } catch (error) {
    console.error('Erreur uploadVideo:', error)
    throw error
  }
}

export async function deleteResource(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
  try {
    const response = await fetch(`${window.location.origin}/api/upload/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publicId, resourceType })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la suppression de la ressource')
    }
  } catch (error) {
    console.error('Erreur deleteResource:', error)
    throw error
  }
} 