import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full animate-pulse" />
          </div>
          <div className="relative animate-spin-slow">
            <WrenchScrewdriverIcon className="w-24 h-24 mx-auto text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mt-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Site en maintenance
        </h1>
        
        <p className="text-xl text-muted-foreground">
          Notre équipe travaille actuellement sur des améliorations. 
          Nous serons de retour très bientôt !
        </p>

        <div className="pt-8">
          <div className="inline-flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Maintenance en cours...</span>
          </div>
        </div>
      </div>
    </div>
  )
} 