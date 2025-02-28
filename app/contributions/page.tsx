import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Github, Coffee, BookOpen, Video, PenTool } from "lucide-react"
import Link from "next/link"

export default function ContributionsPage() {
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
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 flex items-center">
              <PenTool className="mr-2 h-6 w-6" />
              Créer du Contenu
            </h3>
            <p className="text-muted-foreground mb-4">
              Partagez vos connaissances en créant des articles de qualité pour notre communauté.
            </p>
            <Link href="/contact">
              <Button className="w-full">
                Commencer à Écrire
              </Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 flex items-center">
              <Video className="mr-2 h-6 w-6" />
              Devenir Formateur
            </h3>
            <p className="text-muted-foreground mb-4">
              Créez des formations vidéo et partagez votre expertise avec nos apprenants.
            </p>
            <Link href="/contact">
              <Button variant="outline" className="w-full">
                Nous Contacter
              </Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-semibold mb-4 flex items-center">
              <BookOpen className="mr-2 h-6 w-6" />
              Proposer une idée
            </h3>
            <p className="text-muted-foreground mb-4">
              Contribuez au développement du monde moderne avec vos idées.
            </p>
            <Link href="https://github.com/margoul1Malin" target="_blank">
              <Button variant="outline" className="w-full">
                <Github className="mr-2 h-4 w-4" />
                Voir sur GitHub
              </Button>
            </Link>
          </Card>
        </div>

        <div className="bg-card rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Nos Formateurs</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-background bg-primary/10"
                />
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
              1. Choisissez votre domaine d'expertise (Articles, Vidéos, Formations)
            </p>
            <p className="text-muted-foreground">
              2. Créez votre premier contenu avec nos outils intuitifs
            </p>
            <p className="text-muted-foreground">
              3. Interagissez avec la communauté et recevez des retours
            </p>
            <div className="mt-8">
              <Link href="/contact">
                <Button size="lg" className="mr-4">
                  Créer du Contenu
                </Button>
              </Link>
              <Link href="https://buymeacoffee.com/margoul1n" target="_blank">
                <Button size="lg" variant="outline" className="bg-[#FFDD00] text-black border-[#FFDD00] hover:bg-[#FFDD00]/90 hover:border-[#FFDD00]/90">
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