import Navbar from "@/components/navbar";
import { auth } from "@/lib/firebase";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 text-center text-xs text-white bg-gray-900 py-2">
      <p>© {new Date().getFullYear()} Smart Invoice and Receipt Scanner. All rights reserved.</p>
      <p className="mt-1">Secure authentication powered by Firebase</p>
    </footer>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-18 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          OCR-Based Receipt & Invoice Scanner
        </h1>
        
        <p className="text-xl text-blue-100 max-w-3xl mb-8 leading-relaxed">
          Transform your document management with AI-powered optical character recognition. 
          Extract data instantly from receipts and invoices with unparalleled accuracy.
        </p>
        
        <div className="flex gap-4 mb-16">
          <Link 
            href="/firebase_login" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-700/30"
          >
            Get Started
          </Link>
          <Link 
            href="/register/signup" 
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 border border-gray-600"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 max-w-6xl mx-auto pb-32">
        {/* Feature 1 */}
        <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <h3 className="text-white text-xl font-semibold mb-3">Instant Processing</h3>
          <p className="text-blue-100">
            Upload documents and get extracted data in seconds with our advanced OCR technology.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-white text-xl font-semibold mb-3">Precision Accuracy</h3>
          <p className="text-blue-100">
            AI-powered algorithms ensure over 99% accuracy in data extraction from various document formats.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💾</span>
          </div>
          <h3 className="text-white text-xl font-semibold mb-3">Secure Storage</h3>
          <p className="text-blue-100">
            All your processed documents are securely stored with enterprise-grade encryption.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}