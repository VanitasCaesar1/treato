import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

// In middleware auth mode, each page is protected by default.
// Exceptions are configured via the `unauthenticatedPaths` option.
export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ['/', "/purchase", "/help", "/register", "/login", "/create-hospital", "/contact"],
  },
});

// Match against all pages, with specific handling for authenticated and unauthenticated paths
export const config = {
    matcher: [
      // Protected routes
      '/dashboard',
      '/dashboard/:path*',
      '/profile',
      '/settings/:path*',
      '/staff',
      // Auth routes
      '/callback',
      '/api/auth/:path*',
      '/api/user/:path*',
      '/api/hospital/:path*',
      '/api/patients/:path*',
      '/api/doctors/:path*',
      "/api/appointments/:path*",
      // Public routes (need to be matched to apply middleware rules)
      '/',
      '/purchase',
      '/help',
      "/create-hospital",
      '/register',
      '/login',
      "/contact"
    ]
};