import React from 'react';
import Link from 'next/link';
import { 
  LogIn, 
  UserPlus, 
  Shield, 
  KeyRound 
} from 'lucide-react';
import { getSignInUrl, getSignUpUrl, withAuth } from '@workos-inc/authkit-nextjs';
import { Button } from '@/components/ui/button';
import Navbar from "@/components/hero/Navbar"

export default async function AuthPage() {
  const { user } = await withAuth();
  const signInUrl = await getSignInUrl();
  const signUpUrl = await getSignUpUrl();

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-100">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <div 
            className="bg-white rounded-xl shadow-2xl p-12 max-w-xl mx-auto"
          >
            <Shield className="mx-auto mb-6 text-blue-500" size={64} />
            <h1 className="text-4xl font-bold mb-4 text-blue-600">
              Welcome Back{user.firstName && `, ${user.firstName}`}!
            </h1>
            <p className="text-gray-600 mb-8">
              You're securely logged into your account.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button>
                <Link href="/profile">View Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100">
      <Navbar />
      <div className="container mx-auto px-4 py-44">
        <div 
  
          className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Left Side - Illustration */}
          <div 
            className="hidden md:flex flex-col justify-center items-center bg-blue-50 p-12"
          >
            <KeyRound className="text-blue-500 mb-6" size={96} />
            <h2 className="text-3xl font-bold text-blue-600 mb-4">
              Secure Access
            </h2>
            <p className="text-gray-600 text-center">
              Protect your information with our advanced authentication system
            </p>
          </div>

          {/* Right Side - Authentication Options */}
          <div className="p-12 space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-blue-600 mb-4">
                Get Started
              </h1>
              <p className="text-gray-600">
                Choose how you want to access your account
              </p>
            </div>

            <div className="space-y-4">
              <Link href={signInUrl}>
                <Button 
                  variant="outline" 
                  className="w-full py-6 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <LogIn className="mr-3" />
                  Sign In to Your Account
                </Button>
              </Link>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <Link href={signUpUrl}>
                <Button 
                  className="w-full py-6 bg-blue-500 hover:bg-blue-600"
                >
                  <UserPlus className="mr-3" />
                  Create New Account
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-gray-500 mt-6">
              <p>
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-blue-500 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-500 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}