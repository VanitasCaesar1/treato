import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

// In middleware auth mode, each page is protected by default.
// Exceptions are configured via the `unauthenticatedPaths` option.
export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,

    unauthenticatedPaths: [
      '/', 
      "/purchase", 
      "/help", 
      "/register", 
      "/login", 
      "/create-hospital", 
      "/contact",
      "/no-organization", // Custom error page for no organization
      // Payment-related public paths
      "/plans", 
      "/payment-success",
      "/payment-failed",
      // API routes that need to be publicly accessible
      "/api/payment/callback",
      "/api/payment/webhook"
    ],
  },
});


// Match against all pages, with specific handling for authenticated and unauthenticated paths
export const config = {
  matcher: [
    // Protected routes
    '/dashboard',
    '/dashboard/:path*',
    '/profile',
    '/profile/:path*',
    '/records',
    "/records/:path*",
    '/settings',
    '/settings/:path*',
    '/staff',
    '/staff/:path*',
    '/patients',
    "/patients/:path*",
    '/doctors',
    "/doctors/:path*",
    '/appointments',
    "/appointments/:path*",
    '/hospital',
    "/hospital/:path*",
    
    // Protected API routes
    '/api/user/:path*',
    '/api/hospital/:path*',
    '/api/patients/:path*',
    '/api/doctors/:path*',
    "/api/appointments/:path*",
    "/api/transactions/:path*",
    
    // Auth routes
    '/callback',
    
    // Public routes (need to be matched to apply middleware rules)
    '/',
    '/purchase',
    '/plans',
    '/help',
    "/create-hospital",
    '/register',
    '/login',
    "/contact",
    "/no-organization", // Custom error page for no organization
    "/payment-success",
    "/payment-failed",
    
    // Public API endpoints
    "/api/payment/callback",
    "/api/payment/webhook",
    "/api/payment/test-credentials",
    "/api/payment/initiate", // This is public for testing
  ]
};