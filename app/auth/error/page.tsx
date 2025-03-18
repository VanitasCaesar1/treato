'use client';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'Authentication error';
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-red-50 p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Authentication Error</h1>
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