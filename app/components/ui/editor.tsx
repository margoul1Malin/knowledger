'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface EditorProps extends Omit<ComponentProps<typeof MDEditor>, 'onChange'> {
  onChange: (value: string) => void
}

export function Editor({ onChange, ...props }: EditorProps) {
  return (
    <div data-color-mode="auto">
      <MDEditor
        {...props}
        onChange={(value) => onChange(value || '')}
      />
    </div>
  )
} 