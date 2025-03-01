import FormatorForm from '@/app/components/ui/formator/FormatorForm'
import { Toaster } from '@/components/ui/toaster'

export default function FormatorQueryPage() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Devenir Formateur
            </h1>
            <p className="text-xl text-muted-foreground">
              Rejoignez notre communauté de formateurs et partagez votre expertise avec nos apprenants.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <FormatorForm />
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              En soumettant ce formulaire, vous acceptez que nous examinions votre candidature et que nous vous contactions par email.
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
} 