import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
// Note: lucide-react is a client-side library for icons.
// In a server component, you'd typically use SVG directly or a server-compatible icon solution.
// For simplicity, we'll keep the icon rendering here assuming it's part of the JSX output
// that Next.js handles, but be mindful of client-only imports in server components.
import { AlertCircle } from 'lucide-react'; // Keep import if rendering JSX with it

// This component is a Server Component by default in the app directory

export default async function NotAdminPage() { // Make the component async to await withAuth
  // Fetch auth data directly on the server
  // withAuth handles authentication and might redirect unauthenticated users
  // based on your WorkOS configuration.
  const { user, isLoading } = await withAuth(); // Await the withAuth call

  // In a server component, isLoading is less relevant for the primary render path
  // as data is typically fetched before the component renders.
  // However, if withAuth itself has an async loading phase before returning user,
  // this check could still be relevant, though less common than in client components.
  // For typical use, the redirect will happen before this loading state is ever rendered.
  if (isLoading) {
     // Server components usually rely on parent loading.js or Suspense for loading states.
     // This div might not be seen in practice for the initial load.
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // If user is an admin, redirect them to create-hospital page
  // Note: Ensure your WorkOS configuration sets the 'role' claim correctly.
  // The original code checked for user?.role === 'admin'. We'll keep that logic.
  if (user?.role === 'admin') {
    redirect('/create-hospital'); // Perform the server-side redirect
  }

  // If the user is loaded but is NOT an admin (or if user is null, though withAuth
  // often redirects unauthenticated users), render the "Admin Access Required" message.
  // Assuming the user is authenticated but lacks the 'admin' role here.
  // If user is null, withAuth would likely handle the redirect to login page first.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border border-red-100">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            {/* Using AlertCircle from lucide-react. Ensure this is compatible
                in a server component context or replace with a direct SVG if needed. */}
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Admin Access Required</h1>

        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-gray-700 text-center">
            You need administrator privileges to create or manage hospitals in the system.
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-medium text-gray-700 mb-2">What you can do:</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Contact your organization administrator for access</li>
              {/* Use standard <a> tags for navigation in server components */}
              <li>Return to the dashboard to access other features</li>
              <li>If you believe this is an error, contact support</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {/* Use standard <a> tags for navigation in server components */}
          <a
            href="/dashboard"
            className="block text-center w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
          {/* Use standard <a> tags for navigation in server components */}
          <a
            href="/"
            className="block text-center w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}
