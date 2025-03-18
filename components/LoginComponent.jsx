"use client"
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LoginComponent = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    validateEmail(inputEmail);
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    validatePassword(inputPassword);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate both fields before submission
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/auth/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle successful login
        toast.success("Login successful");

        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        // Handle login errors
        const errorData = await response.json();
        toast.error(errorData.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#4CC9FE] p-4">
      <div className="w-full max-w-lg border-2 border-black rounded-3xl p-4 bg-white">
        <Toaster position="top-right" />
        <div className="flex flex-col gap-4 p-6">
          <h1 className="text-3xl font-bold text-center">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full p-2 border-2 rounded-2xl ${
                  emailError 
                    ? "border-red-500 bg-red-50" 
                    : "border-black"
                }`}
                disabled={isLoading}
              />
              {emailError && (
                <p className="text-red-500 text-md">{emailError}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full p-2 border-2 rounded-2xl ${
                  passwordError 
                    ? "border-red-500 bg-red-50" 
                    : "border-black"
                }`}
                disabled={isLoading}
              />
              {passwordError && (
                <p className="text-red-500 text-md">{passwordError}</p>
              )}
              <div className="text-right">
                <Link href="/reset-password" className="text-sm text-black hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            
            <button
              type="submit"
              className={`w-full bg-white text-black text-lg font-semibold mt-4 px-8 py-3 rounded-full
               border-2 border-black cursor-pointer transition-all duration-300
               hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[2px_5px_0_0_#000]
               active:translate-y-0.5 active:translate-x-0.5 active:shadow-none
               ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <button
            type="button"
            className="w-full bg-white text-black text-lg font-semibold mt-6 px-8 py-3 rounded-full
             border-2 border-black cursor-pointer transition-all duration-300
             hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[2px_5px_0_0_#000]
             active:translate-y-0.5 active:translate-x-0.5 active:shadow-none flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 48 48">
              <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Sign In with Google
          </button>
          <div className="text-center mt-2">
            <p>Don't have an account? <Link href="/register" className="text-black font-semibold hover:underline">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;