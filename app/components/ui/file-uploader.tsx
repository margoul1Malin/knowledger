"use client"

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export interface FileUploaderProps {
  onUpload: (file: File) => void
  accept?: string
  maxSize?: number
  isLoading?: boolean
  selectedFile?: File | null
}

export function FileUploader({
  onUpload,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB par défaut
  isLoading = false,
  selectedFile = null
}: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [accept]: []
    },
    maxSize,
    multiple: false,
    disabled: isLoading
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <ArrowUpTrayIcon className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm">
          {selectedFile ? (
            <p className="font-medium text-primary">{selectedFile.name}</p>
          ) : (
            <>
              <p className="font-medium">
                Glissez-déposez un fichier ici ou cliquez pour sélectionner
              </p>
              <p className="text-muted-foreground">
                {accept === 'image/*' ? 'PNG, JPG ou GIF' : 'MP4, WebM ou MOV'} jusqu'à {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </>
          )}
        </div>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Chargement en cours...</p>
        )}
      </div>
    </div>
  )
} 