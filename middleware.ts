import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/formations',
  '/videos',
  '/publicprofiles',
  '/search',
  '/formatorquery',
  '/contact'
]

// Routes toujours accessibles même en maintenance
const publicRoutes = [
  '/login',
  '/auth/signin',
  '/auth/verify',
  '/maintenance'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Ignorer les routes d'API et les assets
  if (
    path.startsWith('/api') || 
    path.startsWith('/_next') || 
    path.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  // Vérifier le token d'authentification
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const isAdmin = token?.role === 'ADMIN'

  // Récupérer les paramètres depuis les cookies
  const settings = {
    maintenanceMode: request.cookies.get('maintenanceMode')?.value === 'true',
    registrationsClosed: request.cookies.get('registrationsClosed')?.value === 'true'
  }

  // Si le mode maintenance est activé et l'utilisateur n'est pas admin
  if (settings.maintenanceMode && !isAdmin && !publicRoutes.includes(path)) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  // Si les inscriptions sont fermées et l'utilisateur tente de s'inscrire
  if (settings.registrationsClosed && (path === '/register' || path === '/auth/signup')) {
    return NextResponse.redirect(new URL('/auth/closed', request.url))
  }

  // Rediriger les utilisateurs non connectés vers /register pour les routes protégées
  if (!isAuthenticated && protectedRoutes.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/register', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 