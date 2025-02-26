import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const legalPages = [
  {
    title: 'Politique de Confidentialité',
    description: 'Découvrez comment nous protégeons et utilisons vos données personnelles.',
    href: '/legal/privacy',
  },
  {
    title: 'Conditions d\'Utilisation',
    description: 'Les règles et conditions d\'utilisation de notre plateforme.',
    href: '/legal/terms',
  },
  {
    title: 'Politique des Cookies',
    description: 'Informations sur l\'utilisation des cookies sur notre site.',
    href: '/legal/cookies',
  },
]

export default function LegalPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center mb-12">Mentions Légales</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {legalPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="group p-6 rounded-xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">
              {page.title}
            </h2>
            <p className="text-muted-foreground mb-4">
              {page.description}
            </p>
            <div className="flex items-center text-primary">
              <span>Lire plus</span>
              <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
