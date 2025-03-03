'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { uploadImage, uploadVideo } from '@/lib/cloudinary'
import type { UploadResult } from '@/lib/cloudinary'

interface FileUploadProps {
  onUploadComplete: (result: UploadResult) => void
  onUploadError?: (error: Error) => void
  type: 'image' | 'video'
  maxSize?: number
  className?: string
  value?: string
}

export default function FileUpload({
  onUploadComplete,
  onUploadError,
  type,
  maxSize = type === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024,
  className,
  value
}: FileUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0]
      if (!file) return

      const uploadFn = type === 'image' ? uploadImage : uploadVideo
      const result = await uploadFn(file)
      onUploadComplete(result)
    } catch (error) {
      console.error('Erreur upload:', error)
      onUploadError?.(error instanceof Error ? error : new Error('Erreur lors du téléchargement'))
    }
  }, [type, onUploadComplete, onUploadError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: type === 'image' 
      ? { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }
      : { 'video/*': ['.mp4', '.webm', '.ogg'] },
    maxSize,
    multiple: false
  })

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-border'
      } ${className}`}
    >
      <input {...getInputProps()} />
      
      {value ? (
        type === 'image' ? (
          <div className="relative w-full aspect-video">
            <Image
              src={value}
              alt="Aperçu"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ) : (
          <video src={value} className="w-full rounded-lg" controls />
        )
      ) : (
        <div className="py-4">
          {isDragActive ? (
            <p>Déposez le fichier ici...</p>
          ) : (
            <p>
              Glissez-déposez {type === 'image' ? 'une image' : 'une vidéo'} ici, ou cliquez pour sélectionner
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {type === 'image' 
              ? 'PNG, JPG ou GIF'
              : 'MP4, WEBM ou OGG'} (max. {Math.round(maxSize / 1024 / 1024)}MB)
          </p>
        </div>
      )}
    </div>
  )
} 