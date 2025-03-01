import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import SessionProvider from './providers/SessionProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import CookieConsent from './components/CookieConsent'

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
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 pt-16">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="bottom-right" />
            <CookieConsent />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
