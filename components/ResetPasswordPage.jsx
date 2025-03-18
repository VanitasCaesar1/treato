"use client"
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Link from 'next/link';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const router = useRouter();
  const { token } = router.query;
  
  // Validate token when component mounts
  useEffect(() => {
    if (!token) return;
    
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
        
        if (response.ok) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch (error) {
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };
    
    validateToken();
  }, [token]);
  
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    
    setConfirmPasswordError('');
    return true;
  };
  
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };
  
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (!isPasswordValid || !isConfirmPasswordValid) {
      toast.error(passwordError || confirmPasswordError || 'Please fix the errors in the form');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      toast.success('Password reset successful!');
      setIsSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => router.push('/login'), 3000);
      
    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.message.includes('token') || error.message.includes('expired')) {
        errorMessage = 'The password reset link is invalid or has expired. Please request a new one.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isValidating) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#4CC9FE] p-4">
        <div className="w-full max-w-lg border-2 border-black rounded-3xl p-6 bg-white text-center">
          <h2 className="text-2xl font-bold mb-4">Validating Reset Link</h2>
          <p>Please wait while we validate your password reset link...</p>
        </div>
      </div>
    );
  }
  
  if (!isValidToken) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#4CC9FE] p-4">
        <div className="w-full max-w-lg border-2 border-black rounded-3xl p-6 bg-white text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
          <p className="mb-6">The password reset link is invalid or has expired.</p>
          <Link
            href="/reset-password"
            className="w-full bg-white text-black text-lg font-semibold mt-4 px-8 py-3 rounded-full
             border-2 border-black cursor-pointer transition-all duration-300
             hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[2px_5px_0_0_#000]
             active:translate-y-0.5 active:translate-x-0.5 active:shadow-none inline-block"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#4CC9FE] p-4">
        <div className="w-full max-w-lg border-2 border-black rounded-3xl p-6 bg-white text-center">
          <h2 className="text-2xl font-bold mb-4">Password Reset Complete</h2>
          <p className="mb-4">Your password has been successfully updated.</p>
          <p className="text-sm text-gray-600 mb-6">You will be redirected to the login page shortly.</p>
          <Link
            href="/login"
            className="w-full bg-white text-black text-lg font-semibold mt-4 px-8 py-3 rounded-full
             border-2 border-black cursor-pointer transition-all duration-300
             hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[2px_5px_0_0_#000]
             active:translate-y-0.5 active:translate-x-0.5 active:shadow-none inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#4CC9FE] p-4">
      <div className="w-full max-w-lg border-2 border-black rounded-3xl p-6 bg-white">
        <Toaster position="top-right" />
        
        <h1 className="text-3xl font-bold text-center mb-2">Set New Password</h1>
        <p className="text-center text-gray-600 mb-6">
          Create a new, strong password for your account.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full p-2 border-2 rounded-2xl ${
                passwordError 
                  ? "border-red-500 bg-red-50" 
                  : "border-black"
              }`}
              placeholder="********"
              disabled={isLoading}
            />
            {passwordError && (
              <p className="text-red-500 text-md">{passwordError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              At least 8 characters with uppercase letters and numbers
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full p-2 border-2 rounded-2xl ${
                confirmPasswordError 
                  ? "border-red-500 bg-red-50" 
                  : "border-black"
              }`}
              placeholder="********"
              disabled={isLoading}
            />
            {confirmPasswordError && (
              <p className="text-red-500 text-md">{confirmPasswordError}</p>
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
            {isLoading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;