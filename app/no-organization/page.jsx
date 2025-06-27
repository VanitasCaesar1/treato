import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// This component is a Server Component by default in the app directory

export default async function NoOrgPage() { // Make the component async to await withAuth
  // Fetch auth data directly on the server
  const { user, isLoading } = await withAuth(); // Await the withAuth call

  // If user data is still loading (shouldn't happen often in a server component context
  // unless there's an issue with the auth kit setup or request),
  // you might render a minimal loading state or handle it differently.
  // However, redirects typically happen before rendering the main content.
  if (isLoading) {
    // In a server component, loading states are usually handled by Next.js's
    // Suspense boundary or parent loading.js files. Rendering a simple div here
    // is less common for the initial load but kept for clarity if needed.
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is loaded and has an organization (assuming Role === 'admin' implies this), redirect to dashboard
  // Note: Ensure your WorkOS configuration sets the 'Role' claim correctly.
  if (user?.Role === 'admin') {
    redirect('/create-hospital'); // Perform the redirect
  }

  // If the user is loaded but not an admin, render the restricted access message
  // or if user is null (not authenticated) - though withAuth should handle unauthenticated users
  // by redirecting to the login page by default, depending on your WorkOS setup.
  // Assuming the user is authenticated but doesn't have the 'admin' role here.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h1>
        <p className="text-gray-700 mb-6">
          You need to be associated with a hospital to access this area.
        </p>
        <p className="text-gray-700 mb-6">
          If you are a hospital administrator, please create an organization first.
        </p>
        <div className="space-y-4">
          {/* Link back to home or another relevant page */}
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-200"
          >
            Return to Home
          </Link>
          {/* Link to the create hospital page - only shown if not redirected */}
          {/* Consider conditional rendering if this link should truly only be for potential admins */}
          <a
            href="/create-hospital"
            className="inline-block px-6 py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-200"
          >
            Create Hospital
          </a>
        </div>
      </div>
    </div>
  );
}
