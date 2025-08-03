export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    // Protected routes - add any routes that require authentication
    // '/admin/:path*',
    // '/profile/:path*'
  ]
}