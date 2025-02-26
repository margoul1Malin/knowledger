import Link from 'next/link'

const legalLinks = [
  { href: '/legal/privacy', label: 'Politique de confidentialité' },
  { href: '/legal/terms', label: 'Conditions d\'utilisation' },
  { href: '/legal/cookies', label: 'Cookies' },
]

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4">
        <nav className="mb-8">
          <ul className="flex flex-wrap gap-4 justify-center">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
