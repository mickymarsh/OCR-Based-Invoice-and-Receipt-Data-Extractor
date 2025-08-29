"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-95"></div>
      
      {/* Animated shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600 rounded-full mix-blend-soft-light filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-soft-light filter blur-xl opacity-20 animate-bounce delay-700"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-700 rounded-full mix-blend-soft-light filter blur-xl opacity-25 animate-ping delay-1000"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="fixed bottom-4 left-0 right-0 text-center text-xs text-gray-400">
      <p>© {new Date().getFullYear()} Smart Invoice and Receipt Scanne. All rights reserved. </p>
      <p className="mt-1">Secure authentication powered by Firebase</p>
    </footer>
  );r
};

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailOptionClick = () => {
    setShowEmailForm(true);
  };

  const handleEmailSignup = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Signed up:", userCredential.user);
      router.push("form");
    } catch (error) {
      console.error("Signup error:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google signed up:", result.user);
      router.push("form");
    } catch (error) {
      console.error("Google signup error:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Main content container */}
      <div className="w-full max-w-md bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700/50 z-10">
        {/* Logo/Header section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Step 1: Sign up to get started</p>
        </div>

        {!showEmailForm ? (
          // Initial choice screen
          <div className="flex flex-col gap-4">
            <button
              onClick={handleEmailOptionClick}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Sign Up with Email
            </button>
            
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>
            
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign Up with Google
            </button>
          </div>
        ) : (
          // Email form screen
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              onClick={handleEmailSignup}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : "Create Account"}
            </button>
            
            <button
              onClick={() => setShowEmailForm(false)}
              disabled={isLoading}
              className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back to Options
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Step Progress Indicator */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-blue-400 flex items-center justify-center">
                <span className="font-bold text-sm">1</span>
              </div>
              <span className="mt-2 text-xs font-medium text-blue-400">Create Account</span>
            </div>
            
            <div className="h-0.5 flex-grow bg-gray-600 mx-2"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-600 border-4 border-gray-500 flex items-center justify-center">
                <span className="font-bold text-sm text-gray-400">2</span>
              </div>
              <span className="mt-2 text-xs font-medium text-gray-400">Complete Profile</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}