import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import ContactForm from "@/app/components/contact/ContactForm"

export default async function ContactPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/contact")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent text-center">
            Contactez-nous
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            Une question ? Une suggestion ? N'hésitez pas à nous contacter.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  )
} 