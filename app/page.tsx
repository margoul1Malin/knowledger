import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { DocumentIcon, VideoCameraIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import ArticlesCarousel from '@/app/components/articles/ArticlesCarousel'
import CodeCard from '@/app/components/ui/CodeCard'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
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
            
            <div className="hidden lg:block flex-1">
              <CodeCard />
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
