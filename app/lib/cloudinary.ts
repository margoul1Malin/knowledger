import { v2 as cloudinary } from 'cloudinary'

export interface UploadResult {
  url: string
  publicId: string
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!)
  formData.append('folder', 'knowledger/images')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  )

  if (!response.ok) {
    throw new Error('Erreur lors de l\'upload de l\'image')
  }

  const data = await response.json()
  return {
    url: data.secure_url,
    publicId: data.public_id
  }
}

export async function uploadVideo(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!)
  formData.append('folder', 'knowledger/videos')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
    {
      method: 'POST',
      body: formData
    }
  )

  if (!response.ok) {
    throw new Error('Erreur lors de l\'upload de la vidéo')
  }

  const data = await response.json()
  return {
    url: data.secure_url,
    publicId: data.public_id
  }
} 