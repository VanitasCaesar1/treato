"use client"
import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

const RequestResetPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    validateEmail(inputEmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error(emailError || 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }
      
      setRequestSent(true);
      toast.success('Password reset link sent to your email!');
      
    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.message.includes('not found')) {
        // Don't reveal if email exists or not for security reasons
        toast.success('If this email exists in our system, you will receive a password reset link shortly.');
        setRequestSent(true);
        return;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (requestSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#4CC9FE] p-4">
        <div className="w-full max-w-lg border-2 border-black rounded-3xl p-6 bg-white text-center">
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          <p className="mb-4">
            We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            If you don't see the email, check your spam folder or request another reset link.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setRequestSent(false)}
              className="w-full bg-white text-black text-lg font-semibold mt-4 px-8 py-3 rounded-full
               border-2 border-black cursor-pointer transition-all duration-300
               hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[2px_5px_0_0_#000]
               active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
            >
              Request Another Link
            </button>
            <Link
              href="/login"
              className="text-black text-lg font-semibold mt-4 hover:underline"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#4CC9FE] p-4">
      <div className="w-full max-w-lg border-2 border-black rounded-3xl p-6 bg-white">
        <Toaster position="top-right" />
        
        <h1 className="text-3xl font-bold text-center mb-4">Reset Password</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full p-2 border-2 rounded-2xl ${
                emailError 
                  ? "border-red-500 bg-red-50" 
                  : "border-black"
              }`}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-red-500 text-md">{emailError}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-white text-black text-lg font-semibold mt-4 px-8 py-3 rounded-full
             border-2 border-black cursor-pointer transition-all duration-300
             hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[2px_5px_0_0_#000]
             active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          <div className="text-center mt-4">
            <Link href="/login" className="text-black text-lg font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestResetPage;