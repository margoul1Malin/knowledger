'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  accept: {
    [key: string]: string[]
  }
  maxSize: number
  onUpload: (file: File) => Promise<string>
  value?: string
  onChange: (url: string) => void
  previewType: 'image' | 'video'
}

const IMAGE_TYPES = {
  'image/*': [
    '.png', 
    '.jpg', 
    '.jpeg', 
    '.gif', 
    '.webp', 
    '.avif', 
    '.svg'
  ]
}

const VIDEO_TYPES = {
  'video/*': [
    '.mp4',
    '.webm',
    '.ogg',
    '.mov'
  ]
}

export default function FileUpload({
  accept,
  maxSize,
  onUpload,
  value,
  onChange,
  previewType
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0]
      if (error.code === 'file-too-large') {
        setError(`Fichier trop volumineux. Maximum: ${maxSize / (1024 * 1024)}MB`)
      } else if (error.code === 'file-invalid-type') {
        setError('Type de fichier non supporté')
      } else {
        setError('Erreur lors du téléchargement')
      }
      return
    }

    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (err) {
      console.error('Erreur upload:', err)
      setError('Erreur lors de l\'upload. Vérifiez que le dossier public/images existe.')
    } finally {
      setIsUploading(false)
    }
  }, [onUpload, onChange, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: previewType === 'image' ? IMAGE_TYPES : VIDEO_TYPES,
    maxSize,
    maxFiles: 1
  })

  const removeFile = () => {
    onChange('')
    setError('')
  }

  return (
    <div className="space-y-4">
      {!value ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
            hover:border-primary hover:bg-primary/5 cursor-pointer`}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isDragActive
              ? 'Déposez le fichier ici'
              : 'Glissez-déposez un fichier ici, ou cliquez pour sélectionner'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {previewType === 'image' 
              ? 'PNG, JPG, GIF, WEBP, AVIF jusqu\'à 5MB'
              : 'MP4, WEBM, MOV jusqu\'à 100MB'}
          </p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden">
          {previewType === 'image' ? (
            <img src={value} alt="Preview" className="w-full h-48 object-cover" />
          ) : (
            <video src={value} controls className="w-full h-48 object-cover" />
          )}
          <button
            type="button"
            onClick={removeFile}
            className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
          >
            <XMarkIcon className="h-5 w-5 text-foreground" />
          </button>
        </div>
      )}
      
      {isUploading && (
        <div className="text-sm text-muted-foreground">
          Upload en cours...
        </div>
      )}
      
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
} 