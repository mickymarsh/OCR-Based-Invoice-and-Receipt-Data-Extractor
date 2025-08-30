"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth); // logs out the user
      console.log("User logged out");
      console.log(auth.currentUser);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center bg-gray-800 px-6 py-3 text-white">
      {/* Left side - Logo */}
      <div className="text-xl font-bold">MyApp</div>

      {/* Right side - Links */}
      <div className="flex items-center gap-6">
        <Link href="/login" className="hover:text-gray-300">
          Login
        </Link>
        <Link href="/register" className="hover:text-gray-300">
          Register
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-2xl focus:outline-none"
          >
            👤
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg flex flex-col">
              <Link
                href="/profile"
                className="px-4 py-2 hover:bg-gray-100 rounded-t-lg"
              >
                Your Profile
              </Link>
              <Link
                href="/history"
                className="px-4 py-2 hover:bg-gray-100"
              >
                Your History
              </Link>
              <button 
              onClick={handleLogout}
              className="px-4 py-2 hover:bg-gray-100 text-left rounded-b-lg">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
