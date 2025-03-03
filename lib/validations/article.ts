import * as z from 'zod'

export const articleSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  content: z.string().min(1, "Le contenu est requis"),
  imageUrl: z.string().min(1, "L'image de couverture est requise"),
  imagePublicId: z.string().min(1, "L'ID public de l'image est requis"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  isPremium: z.boolean().default(false)
}) 