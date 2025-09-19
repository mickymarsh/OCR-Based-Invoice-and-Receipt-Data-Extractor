"use client";

import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  return (
    <header className="w-full bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 py-4 px-6 flex items-center justify-between shadow-sm">
      <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">OCR Invoice & Receipt Extractor</h1>
      <div className="flex items-center gap-4">
        {/* Notification icon */}
        <button
          onClick={() => router.push("/notifications")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 transition-all shadow cursor-pointer"
          title="Notifications"
        >
          <svg className="w-6 h-6 text-[#2F86A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        {/* Profile icon */}
        <button
          onClick={() => router.push("/profile")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/80 transition-all shadow cursor-pointer"
          title="Profile"
        >
          <svg className="w-6 h-6 text-[#2F86A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white font-bold py-2 px-6 rounded-2xl hover:scale-105 transition-all cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    </header>
  );
};

export default Header;
