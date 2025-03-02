import { cache } from 'react'
import prisma from '@/lib/prisma'

export interface AdminSettings {
  maintenanceMode: boolean
  registrationsClosed: boolean
}

export const getAdminSettings = cache(async () => {
  let settings = await prisma.adminSettings.findFirst()
  
  if (!settings) {
    settings = await prisma.adminSettings.create({
      data: {
        maintenanceMode: false,
        registrationsClosed: false
      }
    })
  }

  return settings
}) 