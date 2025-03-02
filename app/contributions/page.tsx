import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Github, Coffee, BookOpen, Video, PenTool, Crown, Check } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

async function getFormateurs() {
  const formateurs = await prisma.user.findMany({
    where: {
      role: 'FORMATOR'
    },
    select: {
      id: true,
      name: true,
      image: true
    },
    take: 5,
    orderBy: {
      createdAt: 'desc'
    }
  })
  return formateurs
}

export default async function ContributionsPage() {
  const formateurs = await getFormateurs()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Contribuez à Knowledger
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Partagez votre expertise et aidez-nous à créer la meilleure plateforme de formation en ligne.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col h-[300px]">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <PenTool className="mr-2 h-6 w-6" />
                Créer du Contenu
              </h3>
              <p className="text-muted-foreground mb-4">
                Partagez vos connaissances en créant des articles de qualité pour notre communauté. Soyez rémunérés pour votre travail et gagner des récompenses pour votre contribution dans l'apprentissage de nos apprenants. Et vous pourrez améliorer votre présence en ligne.
              </p>
            </div>
            <Link href="/formatorquery" className="mt-auto">
              <Button className="w-full">
                Commencer à Écrire
              </Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col h-[300px]">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Video className="mr-2 h-6 w-6" />
                Devenir Formateur
              </h3>
              <p className="text-muted-foreground mb-4">
              Créez des formations vidéo et partagez votre expertise avec nos apprenants. Soyez rémunérés pour votre travail et gagner des récompenses pour votre contribution dans l'apprentissage de nos apprenants.
              </p>
            </div>
            <Link href="/formatorquery" className="">
              <Button variant="outline" className="w-full">
                Nous Contacter
              </Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 flex flex-col h-[300px] relative">
            <div className="absolute top-2 right-2">
              <Crown className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-4 flex items-center text-primary">
                Devenir Premium
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <p className="text-muted-foreground">Accès illimité aux formations</p>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <p className="text-muted-foreground">Contenu exclusif premium</p>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <p className="text-muted-foreground">Support prioritaire</p>
                </div>
              </div>
            </div>
            <div className="mt-auto">
              <Link href="/premium">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Crown className="mr-2 h-4 w-4" />
                  Passer Premium
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground mt-4">
                À partir de 24,99€/mois
              </p>
            </div>
          </Card>
        </div>

        <div className="bg-card rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Nos Formateurs</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex -space-x-4">
              {formateurs.map((formateur) => (
                <Avatar
                  key={formateur.id}
                  className="w-12 h-12 border-2 border-background"
                >
                  <AvatarImage src={formateur.image || undefined} alt={formateur.name || 'Formateur'} />
                  <AvatarFallback>
                    {formateur.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
          <p className="text-center mt-6 text-muted-foreground">
            Rejoignez notre communauté de formateurs passionnés !
          </p>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Comment Commencer ?</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-muted-foreground">
              1. Envoyez nous votre demande ici : <Link href="/formatorquery" className="text-primary underline font-extrabold">Formulaire Formateur</Link>
            </p>
            <p className="text-muted-foreground">
              2. Créez votre premier contenu avec nos outils intuitifs
            </p>
            <p className="text-muted-foreground">
              3. Interagissez avec la communauté et recevez des retours
            </p>
            <div className="mt-8 flex flex-col justify-center items-center sm:flex-row gap-4">
              <Link href="/formatorquery" className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                  Créer du Contenu
                </Button>
              </Link>
              <Link href="https://buymeacoffee.com/margoul1n" target="_blank" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full bg-[#FFDD00] text-black border-[#FFDD00] hover:bg-[#FFDD00]/90 hover:border-[#FFDD00]/90">
                  <Coffee className="mr-2 h-4 w-4" />
                  Buy me a coffee
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center bg-card rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">Pourquoi Contribuer ?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-2">Partagez</h3>
              <p className="text-muted-foreground">
                Transmettez vos connaissances et aidez les autres à progresser
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Gagnez</h3>
              <p className="text-muted-foreground">
                Monétisez votre expertise avec notre système de contenu premium
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Évoluez</h3>
              <p className="text-muted-foreground">
                Développez votre présence en ligne et votre réseau professionnel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 