'use client'

import { toast as showToast } from 'react-hot-toast'

interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastOptions) => {
    if (variant === 'destructive') {
      showToast.error(description || title)
    } else {
      showToast.success(description || title)
    }
  }

  return { toast }
}
