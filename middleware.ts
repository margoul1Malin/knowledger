import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req })
  const isAuthenticated = !!token

  // Routes publiques
  const publicRoutes = ['/', '/login', '/register']
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Routes protégées
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Routes spécifiques aux rôles
  if (req.nextUrl.pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (req.nextUrl.pathname.startsWith('/formateur') && token?.role !== 'FORMATOR') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/formateur/:path*',
    '/profile/:path*',
    '/formations/:path*',
    '/videos/:path*',
    '/articles/:path*',
  ],
} 