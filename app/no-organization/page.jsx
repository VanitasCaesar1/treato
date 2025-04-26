// app/no-organization/page.jsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@workos-inc/authkit-nextjs';

export default function NoOrgPage() {
  const router = useRouter();
  const { user, isLoading } = withAuth();

  useEffect(() => {
    // If user is loaded and has an organization, redirect to dashboard
    if (!isLoading && user?.organizationId) {
      router.push('/dashboard');
    } else if (user?.Role === 'admin') {
        router.push('/create-hospital');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-red-50 p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Access Restricted</h1>
        <p className="text-gray-700">You need to be associated with a hospital to access this area</p>
        <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-500">
                If you are a hospital administrator, please create an organization first.
            </p>
            <a
                href="/"
                className="block text-center bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
            >
                Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}