import Link from 'next/link'
import { 
  Github,
  Twitter,
  Coffee,
  ExternalLink,
  BookOpen,
  Code2,
  Store,
  Youtube,
  Gamepad2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const externalLinks = [
  {
    title: "Margoul1 Store",
    description: "Découvrez ma boutique en ligne de produits gaming et tech.",
    href: "https://real-margoul1-store.vercel.app/",
    icon: Store,
    color: "bg-purple-500"
  },
  {
    title: "Docify",
    description: "Pour de la création de documentation facile et rapide",
    href: "https://www.docify.ink/",
    icon: BookOpen,
    color: "bg-indigo-600"
  },
  {
    title: "Github",
    description: "Suivez mes actualités et pensées sur le développement.",
    href: "https://github.com/margoul1Malin",
    icon: Github,
    color: "bg-gray-900"
  },
  {
    title: "Buy Me a Coffee",
    description: "Soutenez mon travail et mes projets.",
    href: "https://buymeacoffee.com/margoul1n",
    icon: Coffee,
    color: "bg-yellow-500"
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            À Propos de KnowLedger
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une plateforme d'apprentissage moderne dédiée au partage de connaissances et à la formation continue.
          </p>
        </div>

        {/* Présentation du site */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Notre Mission
              </h2>
              <p className="text-muted-foreground">
                KnowLedger est né de la passion pour l'apprentissage et le partage de connaissances. 
                Notre plateforme offre un espace où experts et futurs experts se rencontrent pour échanger, 
                apprendre et grandir ensemble.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Code2 className="h-6 w-6 text-primary" />
                Technologies
              </h2>
              <p className="text-muted-foreground">
                Développée avec les dernières technologies web, KnowLedger utilise Next.js, 
                TypeScript et Tailwind CSS pour offrir une expérience utilisateur fluide et moderne. 
                Notre architecture robuste garantit performance et sécurité.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              L'Administrateur
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                J&apos;me faisais chier ducoup c'est a peu près comme ça que j&apos;ai pondu le site, à savoir que j'ai fait un calcul rénal lors du sa création j&apos;étais vraiment deter mdr.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className='text-primary'>• Développeur Full Stack</li>
                <li className='text-primary'>• Technicien Système</li>
                <li className='text-primary'>• Hacker à ses heures perdues</li>
                <li className='text-primary'>• Formateur passionné</li>
              </ul>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button asChild variant="outline" size="sm">
                  <Link href="https://github.com/margoul1Malin" target="_blank">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="https://x.com/PinokioS1ffredi" target="_blank">
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="https://www.youtube.com/@Margoul1n" target="_blank">
                    <Youtube className="mr-2 h-4 w-4" />
                    YouTube
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Liens externes */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Découvrez Mes Autres Projets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {externalLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                target="_blank"
                className="group block bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className={`${link.color} w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <link.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  {link.title}
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Call-to-action */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-semibold mb-4">Prêt à Commencer ?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté grandissante et commencez votre voyage d'apprentissage dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/formatorquery">
                Devenir Formateur
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/premium">
                Découvrir Premium
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 