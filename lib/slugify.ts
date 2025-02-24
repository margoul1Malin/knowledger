export default function slugify(text: string): string {
  // Génère un identifiant unique de 6 caractères
  const uniqueId = Math.random().toString(36).substring(2, 8)
  
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  // Ajoute l'identifiant unique à la fin du slug
  return `${slug}-${uniqueId}`
} 