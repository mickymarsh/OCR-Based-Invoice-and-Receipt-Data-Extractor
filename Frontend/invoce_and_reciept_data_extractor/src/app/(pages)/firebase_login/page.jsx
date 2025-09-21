"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

// Light ocean gradient background
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-emerald-100 opacity-95"></div>
    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-soft-light filter blur-3xl opacity-25 animate-bounce delay-700"></div>
    <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-200 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-ping delay-1000"></div>
  </div>
);

const Footer = () => (
  <footer className="fixed bottom-4 left-0 right-0 text-center text-xs text-gray-600">
    <p>© {new Date().getFullYear()} Smart Invoice and Receipt Scanner. All rights reserved. </p>
    <p className="mt-1">Secure authentication powered by Firebase</p>
  </footer>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", userCredential.user);
      router.push("dashboard");
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google logged in:", result.user);
      router.push("dashboard");
    } catch (error) {
      console.error("Google login error:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-emerald-200/50 z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            Login to Your Account
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Access your dashboard</p>
        </div>

        {/* Email + Password */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input
              className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
            <input
              className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={handleEmailLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-400 hover:to-emerald-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-emerald-300/40 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* OR divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-gray-300/40 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Login with Google
        </button>

        {/* Error message */}
        {error && (
          <div className="mt-6 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
