import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { DocumentIcon, VideoCameraIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import ArticlesCarousel from '@/app/components/articles/ArticlesCarousel'
import CodeCard from '@/app/components/ui/CodeCard'
import RecentContentCarousel from '@/app/components/ui/RecentContentCarousel'
import { format } from "date-fns";

interface Parcours {
  id: string;
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
  imagePublicId?: string;
  createdAt: string;
}

async function getRecentParcours(): Promise<Parcours[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/parcours/recent`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      console.error('Failed to fetch recent parcours')
      return []
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching recent parcours:', error)
    return []
  }
}

export default async function Home() {
  const recentParcours = await getRecentParcours()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-72">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/50 -z-10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] -z-10" />
        
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Apprenez. Évoluez. Excellez.
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Découvrez une nouvelle façon d'apprendre avec notre plateforme de formation innovante. Articles, vidéos et formations pour développer vos compétences.
              </p>
              <div className="flex gap-4">
                <Link 
                  href="/formations"
                  className="group flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                >
                  Commencer maintenant
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/articles"
                  className="px-6 py-3 text-primary border-2 border-primary rounded-full hover:bg-primary/10"
                >
                  Explorer les articles
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <div className="relative">
                <CodeCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-card-foreground">
            Ce qui nous rend uniques
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-background border border-border hover:border-primary hover:shadow-lg"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Content Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-card-foreground">
              Contenus récents
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Link 
                href="/articles"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <DocumentIcon className="h-4 w-4" />
                Voir tous les articles
              </Link>
              <Link 
                href="/videos"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <VideoCameraIcon className="h-4 w-4" />
                Voir toutes les vidéos
              </Link>
              <Link 
                href="/formations"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <AcademicCapIcon className="h-4 w-4" />
                Voir toutes les formations
              </Link>
            </div>
          </div>
          
          <RecentContentCarousel />
        </div>
      </section>

      {/* Section Parcours Préférés */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Nos Parcours Préférés
            </h2>
            <p className="text-lg text-muted-foreground">
              Découvrez nos parcours d'apprentissage soigneusement conçus pour vous guider étape par étape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {recentParcours.map((parcours) => (
              <Link
                key={parcours.id}
                href={`/parcours/${parcours.slug}`}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary transition-colors duration-300"
              >
                {/* Image avec overlay */}
                <div className="relative aspect-video">
                  <Image
                    src={parcours.imageUrl}
                    alt={parcours.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {parcours.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2">
                    {parcours.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(new Date(parcours.createdAt), 'dd/MM/yyyy')}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/parcours"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              Voir tous les parcours
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Articles de qualité",
    description: "Des articles rédigés par des experts, couvrant les dernières technologies et meilleures pratiques.",
    icon: DocumentIcon
  },
  {
    title: "Vidéos explicatives",
    description: "Des tutoriels vidéo détaillés pour un apprentissage visuel et pratique.",
    icon: VideoCameraIcon
  },
  {
    title: "Formations complètes",
    description: "Des parcours d'apprentissage structurés pour maîtriser un sujet de A à Z.",
    icon: AcademicCapIcon
  }
];
