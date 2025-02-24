import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/layout/Navbar'
import SessionProvider from './providers/SessionProvider'
import { ThemeProvider } from './providers/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KnowLedger - Plateforme de formation',
  description: 'Découvrez nos articles, vidéos et formations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
