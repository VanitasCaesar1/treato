"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { AlertCircle } from 'lucide-react';

export default function NotAdminPage() {
  const router = useRouter();
  const [authData, setAuthData] = useState({ user: null, isLoading: true });

  useEffect(() => {
    // Get authentication data
    const getAuthData = async () => {
      try {
        const { user, isLoading } = withAuth();
        setAuthData({ user, isLoading });
      } catch (error) {
        console.error("Auth error:", error);
        setAuthData({ user: null, isLoading: false });
      }
    };
    getAuthData();
  }, []);

  useEffect(() => {
    // If user is an admin, redirect them to create-hospital page
    if (authData.user?.role === 'admin') {
      router.push('/create-hospital');
    }
  }, [authData, router]);

  // If still loading auth data, show loading state
  if (authData.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border border-red-100">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
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
              <li>Return to the dashboard to access other features</li>
              <li>If you believe this is an error, contact support</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 space-y-3">
          <a
            href="/dashboard"
            className="block text-center w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
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