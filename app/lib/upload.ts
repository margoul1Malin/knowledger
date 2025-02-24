export async function uploadFile(file: File, type: 'image' | 'video'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Erreur lors de l\'upload')
  }

  const data = await response.json()
  return data.url
} 