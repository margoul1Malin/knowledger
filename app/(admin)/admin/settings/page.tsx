'use client'

import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface AdminSettings {
  maintenanceMode: boolean
  registrationsClosed: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    maintenanceMode: false,
    registrationsClosed: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      setSettings(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error)
      toast.error('Erreur lors de la récupération des paramètres')
      setIsLoading(false)
    }
  }

  const updateSetting = async (key: keyof AdminSettings, value: boolean) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')

      setSettings(prev => ({ ...prev, [key]: value }))
      toast.success('Paramètres mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour des paramètres')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres du site</h1>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Active une page de maintenance pour tous les utilisateurs
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              disabled={isSaving}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Fermer les inscriptions</Label>
              <p className="text-sm text-muted-foreground">
                Désactive la possibilité de créer un nouveau compte
              </p>
            </div>
            <Switch
              checked={settings.registrationsClosed}
              onCheckedChange={(checked) => updateSetting('registrationsClosed', checked)}
              disabled={isSaving}
            />
          </div>
        </Card>
      </div>
    </div>
  )
} 