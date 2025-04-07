import { redirect } from "next/navigation";
import { withAuth } from '@workos-inc/authkit-nextjs';
import DashboardPage from "@/components/dashboard/DashboardPage";

// Server component for displaying error when user has no organization
function NoOrgErrorPage({ message }) {
  const errorMessage = message || 'You need to be associated with a hospital to access this area';
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-red-50 p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Access Restricted</h1>
        <p className="text-gray-700">{errorMessage}</p>
        <div className="mt-6">
          <a
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function Dashboard({ searchParams }) {
  // In server components, we can access searchParams directly as props
  const message = searchParams?.message;
  
  // withAuth is already server-side compatible
  const { user, organizationId } = await withAuth({ ensureSignedIn: true });
  
  // Automatic redirection if user is not authenticated
  if (!user) {
    redirect("/login");
  }
  
  // If no organization ID, render the error page with the message from searchParams if available
  if (!organizationId) {
    return <NoOrgErrorPage message={message} />;
  }
  
  // Render the dashboard without passing props that aren't expected
  return (
    <main>
      <DashboardPage />
    </main>
  );
}