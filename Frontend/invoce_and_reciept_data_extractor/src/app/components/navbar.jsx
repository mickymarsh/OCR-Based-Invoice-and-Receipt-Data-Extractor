"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-gray-900 px-4 py-3 border-b border-gray-700">
      <div className="flex justify-between items-center w-full">
        {/* Left side - Dashboard pushed to left corner */}
        <div className="text-xl font-semibold text-white"><Link href="/dashboard">Dashboard</Link></div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center px-2 py-1 text-gray-300 hover:text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Right side - Navigation Links pushed to right corner */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/allExpenses" 
            className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
          >
            All Expenses
          </Link>
          <Link 
            href="/chatbot" 
            className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
          >
            AI Assistant
          </Link>
          <Link 
            href="/doc_upload" 
            className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
          >
            Upload
          </Link>
          <Link 
            href="/" 
            className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
            onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
          >
            Logout
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-all duration-200 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <span className="text-lg">👤</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 py-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setShowDropdown(false)}
                >
                  Your Profile
                </Link>
                <Link
                  href="/hi"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setShowDropdown(false)}
                >
                  Your History
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-gray-900 border-t border-gray-700 rounded-b-lg shadow-lg z-50 py-2 flex flex-col gap-2">
          <Link 
            href="/allExpenses" 
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            All Expenses
          </Link>
          <Link 
            href="/chatbot" 
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            AI Assistant
          </Link>
          <Link 
            href="/doc_upload" 
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            Upload
          </Link>
          <Link 
            href="/" 
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm"
            onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
          >
            Logout
          </Link>
          <button
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm text-left"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            👤 Profile
          </button>
          {showDropdown && (
            <div className="bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 py-1 mt-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => {setShowDropdown(false); setMobileMenuOpen(false);}}
              >
                Your Profile
              </Link>
              <Link
                href="/hi"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => {setShowDropdown(false); setMobileMenuOpen(false);}}
              >
                Your History
              </Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setShowDropdown(false); setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;