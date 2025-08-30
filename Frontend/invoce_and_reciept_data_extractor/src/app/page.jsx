import Link from "next/link";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 text-center text-xs text-white bg-gray-900 py-2 z-10">
      <p>© {new Date().getFullYear()} Smart Invoice and Receipt Scanner. All rights reserved.</p>
      <p className="mt-1">Secure authentication powered by Firebase</p>
    </footer>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
      {/* Falling Stars Background - Evenly distributed */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars distributed across the entire width */}
        <div className="absolute left-[5%] w-1 h-1 bg-white rounded-full animate-star-fall" style={{ animationDelay: '0s' }}></div>
        <div className="absolute left-[15%] w-1.5 h-1.5 bg-blue-200 rounded-full animate-star-fall-reverse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute left-[25%] w-0.5 h-0.5 bg-cyan-100 rounded-full animate-star-fall-fast" style={{ animationDelay: '1s' }}></div>
        <div className="absolute left-[35%] w-1 h-1 bg-white rounded-full animate-star-fall-long" style={{ animationDelay: '4s' }}></div>
        <div className="absolute left-[45%] w-1.5 h-1.5 bg-blue-200 rounded-full animate-star-fall" style={{ animationDelay: '3s' }}></div>
        <div className="absolute left-[55%] w-1 h-1 bg-cyan-100 rounded-full animate-star-fall-reverse" style={{ animationDelay: '5s' }}></div>
        <div className="absolute left-[65%] w-0.5 h-0.5 bg-white rounded-full animate-star-fall-fast" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute left-[75%] w-1 h-1 bg-blue-200 rounded-full animate-star-fall-long" style={{ animationDelay: '6s' }}></div>
        <div className="absolute left-[85%] w-1.5 h-1.5 bg-cyan-100 rounded-full animate-star-fall" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute left-[95%] w-1 h-1 bg-white rounded-full animate-star-fall-reverse" style={{ animationDelay: '3.5s' }}></div>
        
        {/* Additional stars for more density - distributed across the page */}
        <div className="absolute left-[10%] w-0.5 h-0.5 bg-blue-200 rounded-full animate-star-fall-fast" style={{ animationDelay: '7s' }}></div>
        <div className="absolute left-[20%] w-1 h-1 bg-cyan-100 rounded-full animate-star-fall" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute left-[30%] w-1.5 h-1.5 bg-white rounded-full animate-star-fall-reverse" style={{ animationDelay: '4.5s' }}></div>
        <div className="absolute left-[40%] w-1 h-1 bg-blue-200 rounded-full animate-star-fall-long" style={{ animationDelay: '2.2s' }}></div>
        <div className="absolute left-[50%] w-0.5 h-0.5 bg-cyan-100 rounded-full animate-star-fall" style={{ animationDelay: '5.5s' }}></div>
        <div className="absolute left-[60%] w-1.5 h-1.5 bg-white rounded-full animate-star-fall-reverse" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute left-[70%] w-1 h-1 bg-blue-200 rounded-full animate-star-fall-fast" style={{ animationDelay: '6.5s' }}></div>
        <div className="absolute left-[80%] w-0.5 h-0.5 bg-cyan-100 rounded-full animate-star-fall-long" style={{ animationDelay: '3.2s' }}></div>
        <div className="absolute left-[90%] w-1.5 h-1.5 bg-white rounded-full animate-star-fall" style={{ animationDelay: '0.8s' }}></div>
        
        {/* Even more stars for a truly immersive experience */}
        <div className="absolute left-[12%] w-1 h-1 bg-blue-200 rounded-full animate-star-fall-reverse" style={{ animationDelay: '8s' }}></div>
        <div className="absolute left-[22%] w-0.5 h-0.5 bg-cyan-100 rounded-full animate-star-fall-fast" style={{ animationDelay: '1.8s' }}></div>
        <div className="absolute left-[32%] w-1.5 h-1.5 bg-white rounded-full animate-star-fall" style={{ animationDelay: '5.2s' }}></div>
        <div className="absolute left-[42%] w-1 h-1 bg-blue-200 rounded-full animate-star-fall-long" style={{ animationDelay: '2.8s' }}></div>
        <div className="absolute left-[52%] w-0.5 h-0.5 bg-cyan-100 rounded-full animate-star-fall-reverse" style={{ animationDelay: '6.8s' }}></div>
        <div className="absolute left-[62%] w-1.5 h-1.5 bg-white rounded-full animate-star-fall-fast" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute left-[72%] w-1 h-1 bg-blue-200 rounded-full animate-star-fall" style={{ animationDelay: '4.2s' }}></div>
        <div className="absolute left-[82%] w-0.5 h-0.5 bg-cyan-100 rounded-full animate-star-fall-reverse" style={{ animationDelay: '7.5s' }}></div>
        <div className="absolute left-[92%] w-1.5 h-1.5 bg-white rounded-full animate-star-fall-long" style={{ animationDelay: '1.7s' }}></div>
        
        {/* Background glow orbs (subtle) - also distributed */}
        <div className="absolute top-20 left-[20%] w-80 h-80 bg-purple-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute top-40 left-[60%] w-72 h-72 bg-blue-500/8 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-40 left-[40%] w-64 h-64 bg-cyan-400/5 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/3 left-[80%] w-60 h-60 bg-indigo-400/4 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-[10%] w-70 h-70 bg-teal-400/3 rounded-full filter blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
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
      </div>

      <Footer />
    </main>
  );
}