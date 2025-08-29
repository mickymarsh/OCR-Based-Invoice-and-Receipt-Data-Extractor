"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailOptionClick = () => {
    setShowEmailForm(true);
  };

  const handleEmailSignup = async () => {
    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Signed up:", userCredential.user);
      router.push("form");
    } catch (error) {
      console.error("Signup error:", error.message);
      setError(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google signed up:", result.user);
      router.push("form");
    } catch (error) {
      console.error("Google signup error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Step 1: Create Account</h1>

      {!showEmailForm ? (
        // Initial choice screen
        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            onClick={handleEmailOptionClick}
            className="bg-blue-600 px-6 py-3 rounded text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign Up with Email
          </button>
          
          <div className="text-center my-2">OR</div>
          
          <button
            onClick={handleGoogleSignup}
            className="bg-red-600 px-6 py-3 rounded text-lg font-medium hover:bg-red-700 transition-colors"
          >
            Sign Up with Google
          </button>
        </div>
      ) : (
        // Email form screen
        <div className="w-full max-w-md">
          <div className="mb-4">
            <input
              className="w-full p-3 text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              className="w-full p-3 text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={handleEmailSignup}
            className="w-full bg-blue-600 px-6 py-3 rounded text-lg font-medium hover:bg-blue-700 transition-colors mb-4"
          >
            Create Account
          </button>
          
          <button
            onClick={() => setShowEmailForm(false)}
            className="w-full bg-gray-600 px-6 py-3 rounded text-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Back to Options
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-600 rounded text-sm">
          {error}
        </div>
      )}

      {/* Step Progress Indicator */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-8">
          {/* Step 1 - Current/Active */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-600 border-4 border-blue-400 flex items-center justify-center">
              <span className="font-bold">1</span>
            </div>
            <span className="mt-2 text-sm font-medium text-blue-400">Create Account</span>
          </div>
          
          {/* Step 2 - Upcoming */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-600 border-4 border-gray-500 flex items-center justify-center">
              <span className="font-bold text-gray-400">2</span>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-400">Complete Profile</span>
          </div>
        </div>
        
        {/* Connecting line */}
        <div className="absolute top-6 left-14 right-14 h-0.5 bg-gray-500 -z-10"></div>
      </div>
    </div>
  );
}