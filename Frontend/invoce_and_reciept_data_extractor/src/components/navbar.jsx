"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close dropdown on outside click / ESC
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        setShowMobile(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-30 bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 text-white font-semibold tracking-tight"
          >
            <span className="inline-flex h-8 w-8 rounded-xl bg-gray-800 border border-gray-700" />
            <span className="text-lg">Dashboard</span>
          </Link>

          {/* Right: Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
            >
              Register
            </Link>

            {/* Profile */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowDropdown((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showDropdown}
                className="ml-1 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600 hover:bg-gray-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
              >
                <span className="text-lg">👤</span>
              </button>

              {showDropdown && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50 py-1 transition ease-out duration-150"
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
                    onClick={() => setShowDropdown(false)}
                    role="menuitem"
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/history"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
                    onClick={() => setShowDropdown(false)}
                    role="menuitem"
                  >
                    Your History
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowMobile((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={showMobile}
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {showMobile && (
        <div className="md:hidden border-t border-gray-700 bg-gray-900">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/login"
              className="block px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 font-medium"
              onClick={() => setShowMobile(false)}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 font-medium"
              onClick={() => setShowMobile(false)}
            >
              Register
            </Link>

            <div className="h-px bg-gray-700" />

            <Link
              href="/profile"
              className="block px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setShowMobile(false)}
            >
              Your Profile
            </Link>
            <Link
              href="/history"
              className="block px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setShowMobile(false)}
            >
              Your History
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setShowMobile(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
