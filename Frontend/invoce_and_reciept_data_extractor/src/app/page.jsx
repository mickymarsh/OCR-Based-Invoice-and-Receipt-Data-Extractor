import Link from "next/link";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-white relative overflow-hidden">
      {/* Water liquidity transformations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated fluid waves */}
        <div className="absolute w-full h-full">
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path 
              d="M0,100 C150,160 350,40 500,100 C650,160 850,40 1000,100 L1000,300 L0,300 Z" 
              fill="#2F86A6"
              className="animate-wave-slow"
            >
              <animate attributeName="d" 
                dur="15s" 
                repeatCount="indefinite" 
                values="M0,100 C150,160 350,40 500,100 C650,160 850,40 1000,100 L1000,300 L0,300 Z;
                        M0,100 C150,40 350,160 500,100 C650,40 850,160 1000,100 L1000,300 L0,300 Z;
                        M0,100 C150,160 350,40 500,100 C650,160 850,40 1000,100 L1000,300 L0,300 Z" 
              />
            </path>
          </svg>
          
          <svg className="absolute inset-0 w-full h-full opacity-20 translate-y-16" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path 
              d="M0,150 C150,90 350,210 500,150 C650,90 850,210 1000,150 L1000,300 L0,300 Z" 
              fill="#34BE82"
              className="animate-wave-medium"
            >
              <animate attributeName="d" 
                dur="10s" 
                repeatCount="indefinite" 
                values="M0,150 C150,90 350,210 500,150 C650,90 850,210 1000,150 L1000,300 L0,300 Z;
                        M0,150 C150,210 350,90 500,150 C650,210 850,90 1000,150 L1000,300 L0,300 Z;
                        M0,150 C150,90 350,210 500,150 C650,90 850,210 1000,150 L1000,300 L0,300 Z" 
              />
            </path>
          </svg>
          
          <svg className="absolute inset-0 w-full h-full opacity-25 translate-y-32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path 
              d="M0,200 C150,260 350,140 500,200 C650,260 850,140 1000,200 L1000,300 L0,300 Z" 
              fill="#F2F013"
              className="animate-wave-fast"
            >
              <animate attributeName="d" 
                dur="7s" 
                repeatCount="indefinite" 
                values="M0,200 C150,260 350,140 500,200 C650,260 850,140 1000,200 L1000,300 L0,300 Z;
                        M0,200 C150,140 350,260 500,200 C650,140 850,260 1000,200 L1000,300 L0,300 Z;
                        M0,200 C150,260 350,140 500,200 C650,260 850,140 1000,200 L1000,300 L0,300 Z" 
              />
            </path>
          </svg>
        </div>

        {/* Floating elements with liquid drops effect */}
        <div className="absolute left-[15%] top-[20%]">
          <div className="w-10 h-10 bg-[#2F86A6] rounded-full opacity-60 animate-float-slow shadow-lg shadow-[#2F86A6]/30">
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2F86A6] rounded-full opacity-80"></div>
            <div className="absolute -bottom-3 right-1 w-2 h-2 bg-[#2F86A6] rounded-full opacity-70"></div>
          </div>
        </div>
        <div className="absolute left-[65%] top-[15%]">
          <div className="w-12 h-12 bg-[#34BE82] rounded-full opacity-60 animate-float-slower shadow-lg shadow-[#34BE82]/30">
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#34BE82] rounded-full opacity-80"></div>
            <div className="absolute -bottom-4 right-1 w-3 h-3 bg-[#34BE82] rounded-full opacity-70"></div>
          </div>
        </div>
        <div className="absolute left-[30%] top-[60%]">
          <div className="w-8 h-8 bg-[#F2F013] rounded-full opacity-60 animate-float-medium shadow-lg shadow-[#F2F013]/30">
            <div className="absolute -bottom-1 -right-0 w-3 h-3 bg-[#F2F013] rounded-full opacity-80"></div>
            <div className="absolute -bottom-3 right-1 w-2 h-2 bg-[#F2F013] rounded-full opacity-70"></div>
          </div>
        </div>
        <div className="absolute left-[80%] top-[40%]">
          <div className="w-14 h-14 bg-[#0F172A] rounded-full opacity-30 animate-float-slow shadow-lg shadow-[#0F172A]/30">
            <div className="absolute -bottom-2 -right-1 w-6 h-6 bg-[#0F172A] rounded-full opacity-50"></div>
            <div className="absolute -bottom-5 right-2 w-3 h-3 bg-[#0F172A] rounded-full opacity-40"></div>
          </div>
        </div>
        
        {/* Water ripple effects */}
        <div className="absolute left-[45%] top-[35%]">
          <div className="water-ripple"></div>
        </div>
        <div className="absolute left-[75%] top-[65%]">
          <div className="water-ripple delay-300"></div>
        </div>
        <div className="absolute left-[25%] top-[75%]">
          <div className="water-ripple delay-700"></div>
        </div>

        {/* Soft glow orbs with water-like colors */}
        <div className="absolute top-20 left-[20%] w-80 h-80 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 left-[60%] w-72 h-72 bg-gradient-to-br from-[#34BE82]/10 to-[#2F86A6]/10 rounded-full filter blur-3xl animate-pulse-slower"></div>
        <div className="absolute bottom-40 left-[40%] w-64 h-64 bg-gradient-to-bl from-[#2FDD92]/12 to-[#F2F013]/8 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-[80%] w-60 h-60 bg-gradient-to-tr from-[#34BE82]/10 to-[#2F86A6]/10 rounded-full filter blur-3xl animate-pulse-slower"></div>
        <div className="absolute bottom-1/4 left-[10%] w-70 h-70 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full filter blur-3xl animate-pulse-slowest"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center pt-24 px-6 text-center">
          <div className="mb-8 flex items-center justify-center">
            <div className="relative w-20 h-20 mr-4 group">
              {/* Water drop logo effect */}
              <div className="absolute inset-0 bg-[#2F86A6] rounded-tl-full rounded-tr-full rounded-bl-full rotate-45 opacity-90 group-hover:rotate-[135deg] transition-all duration-700 ease-in-out"></div>
              <div className="absolute inset-0 scale-90 bg-[#34BE82] rounded-tl-full rounded-tr-full rounded-bl-full rotate-45 opacity-80 group-hover:rotate-[225deg] transition-all duration-700 ease-in-out delay-100"></div>
              <div className="absolute inset-0 scale-75 bg-[#F2F013] rounded-tl-full rounded-tr-full rounded-bl-full rotate-45 opacity-90 group-hover:rotate-[315deg] transition-all duration-700 ease-in-out delay-200"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2F86A6] rounded-full opacity-80 group-hover:scale-150 group-hover:-translate-y-1 transition-all duration-700"></div>
              <div className="absolute -bottom-3 right-2 w-3 h-3 bg-[#34BE82] rounded-full opacity-70 group-hover:scale-150 group-hover:-translate-y-2 transition-all duration-700 delay-100"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2F86A6] via-[#34BE82] to-[#F2F013] pb-2 drop-shadow-md">
              BudgetMaster
            </h1>
          </div>
          
          <h2 className="text-2xl font-semibold text-[#0F172A] mb-4 drop-shadow-sm">Smart Financial Planning For Everyone</h2>
          
          <div className="relative max-w-3xl mb-8">
            <div className="absolute inset-0 rounded-xl border-2 border-[#3341551a]"></div>
            <div className="absolute inset-0 rounded-xl border border-[#3341551a]"></div>
            <div className="absolute top-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#2F86A6]/70 to-transparent"></div>
            <div className="absolute bottom-0 left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-transparent via-[#34BE82]/70 to-transparent"></div>
            <div className="absolute left-0 top-[10%] bottom-[10%] w-[2px] bg-gradient-to-b from-transparent via-[#2F86A6]/70 to-transparent"></div>
            <div className="absolute right-0 top-[5%] bottom-[5%] w-[2px] bg-gradient-to-b from-transparent via-[#34BE82]/70 to-transparent"></div>
            <p className="text-xl text-[#0F172A] leading-relaxed backdrop-blur-sm bg-white/20 p-6 rounded-xl shadow-xl relative z-10">
              Take control of your finances with our intelligent budget tracker. Monitor spending,
              set savings goals, and visualize your financial growth all in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Link
              href="/firebase_login"
              className="relative overflow-hidden group bg-gradient-to-r from-[#2F86A6] to-[#34BE82] hover:from-[#34BE82] hover:to-[#2F86A6] text-white font-medium px-10 py-4 rounded-xl transition-all duration-500 shadow-lg hover:shadow-[#2F86A6]/50 flex items-center justify-center"
            >
              {/* Water ripple effect on hover */}
              <span className="absolute inset-0 scale-0 rounded-full bg-white/30 group-hover:animate-ripple-effect"></span>
              <span className="absolute inset-0 scale-0 rounded-full bg-white/20 delay-200 group-hover:animate-ripple-effect"></span>
              
              <span className="mr-2 w-5 h-5 inline-block relative z-10">
                <object type="image/svg+xml" data="/assets/icons/rocket.svg" width={20} height={20} className="w-5 h-5" aria-label="Rocket"></object>
              </span>
              <span className="relative z-10">Get Started Free</span>
            </Link>
            <Link
              href="/register/signup"
              className="relative overflow-hidden group bg-gradient-to-r from-[#34BE82] to-[#F2F013] hover:from-[#2F86A6] hover:to-[#34BE82] text-[#0F172A] hover:text-white font-medium px-10 py-4 rounded-xl transition-all duration-500 shadow-lg hover:shadow-[#34BE82]/50 flex items-center justify-center"
            >
              {/* Water ripple effect on hover */}
              <span className="absolute inset-0 scale-0 rounded-full bg-white/30 group-hover:animate-ripple-effect"></span>
              <span className="absolute inset-0 scale-0 rounded-full bg-white/20 delay-200 group-hover:animate-ripple-effect"></span>
              
              <span className="mr-2 w-5 h-5 inline-block relative z-10">
                <object type="image/svg+xml" data="/assets/icons/sparkles.svg" width={20} height={20} className="w-5 h-5" aria-label="Sparkles"></object>
              </span>
              <span className="relative z-10">Create Account</span>
            </Link>
          </div>
          
          {/* Stats Bar - with liquid design */}
          <div className="relative bg-white/30 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-16 max-w-4xl w-full mx-auto overflow-hidden">
            {/* Enhanced border effects */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#3341551a]"></div>
            <div className="absolute inset-0 rounded-2xl border border-[#3341551a]"></div>
            
            {/* Animated liquid borders */}
            <div className="absolute top-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#2F86A6]/70 to-transparent"></div>
            <div className="absolute bottom-0 left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-transparent via-[#34BE82]/70 to-transparent"></div>
            <div className="absolute left-0 top-[10%] bottom-[10%] w-[2px] bg-gradient-to-b from-transparent via-[#2F86A6]/70 to-transparent"></div>
            <div className="absolute right-0 top-[5%] bottom-[5%] w-[2px] bg-gradient-to-b from-transparent via-[#34BE82]/70 to-transparent"></div>
            
            {/* Background liquid effect */}
            <div className="absolute inset-0 -z-0 overflow-hidden">
              <div className="absolute -bottom-5 left-0 right-0 h-16 bg-[#2F86A6]/50 rounded-full filter blur-md transform translate-x-20 animate-slow-shift"></div>
              <div className="absolute -bottom-5 left-0 right-0 h-12 bg-[#34BE82]/30 rounded-full filter blur-md transform -translate-x-10 animate-slow-shift-reverse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="text-center">
                <div className="relative inline-block mb-2">
                  <span className="text-4xl font-bold text-[#2F86A6] drop-shadow-md">30K+</span>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#34BE82] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                </div>
                <p className="text-[#0F172A] mt-2 font-medium">Active Users</p>
              </div>
              <div className="text-center">
                <div className="relative inline-block mb-2">
                  <span className="text-4xl font-bold text-[#34BE82] drop-shadow-md">$2.5M</span>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#2F86A6] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                </div>
                <p className="text-[#0F172A] mt-2 font-medium">Savings Tracked</p>
              </div>
              <div className="text-center">
                <div className="relative inline-block mb-2">
                  <span className="text-4xl font-bold text-[#2F86A6] drop-shadow-md">97%</span>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#34BE82] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                </div>
                <p className="text-[#0F172A] mt-2 font-medium">Budget Success Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid - with liquid effect cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 max-w-6xl mx-auto pb-32">
          {/* Feature 1 */}
          <div className="relative bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 overflow-hidden">
            {/* Enhanced border effects */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#3341551a]"></div>
            <div className="absolute inset-0 rounded-2xl border border-[#3341551a] group-hover:border-[#2F86A6]/30 transition-all duration-500"></div>
            
            {/* Water-like border animations */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2F86A6] opacity-70 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#2F86A6] opacity-50 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#34BE82] opacity-50 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-600 delay-100"></div>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#34BE82] opacity-50 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-600 delay-300"></div>
            
            {/* Liquid animation on hover */}
            <div className="absolute -bottom-32 left-0 right-0 h-40 bg-[#2F86A6]/20 rounded-full filter blur-md transform translate-y-0 group-hover:-translate-y-10 transition-transform duration-700 ease-in-out"></div>
            
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-[#3341551a]">
              {/* Water drop icon effect */}
              <div className="absolute top-0 right-0 w-6 h-6 bg-white/30 rounded-full transform scale-0 group-hover:scale-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700 delay-300"></div>
              <object type="image/svg+xml" data="/assets/icons/expense-chart.svg" width={32} height={32} className="w-10 h-10" aria-label="Expense tracking"></object>
            </div>
            <h3 className="text-[#0F172A] text-xl font-bold mb-4 text-center relative z-10 group-hover:text-[#2F86A6] transition-colors duration-300">Expense Tracking</h3>
            <p className="text-[#0F172A] text-center relative z-10">
              Automatically categorize expenses and track spending patterns with intuitive dashboards and real-time insights.
            </p>
            <div className="mt-8 flex justify-center relative z-10">
              <Link href="/features" className="text-[#2F86A6] font-medium hover:text-[#34BE82] transition-all duration-300 flex items-center">
                <span>Learn more</span>
                <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
              </Link>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="relative bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 overflow-hidden">
            {/* Enhanced border effects */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#3341551a]"></div>
            <div className="absolute inset-0 rounded-2xl border border-[#3341551a] group-hover:border-[#34BE82]/30 transition-all duration-500"></div>
            
            {/* Water-like border animations */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#34BE82] opacity-70 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#34BE82] opacity-50 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2F86A6] opacity-50 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-600 delay-100"></div>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#2F86A6] opacity-50 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-600 delay-300"></div>
            
            {/* Liquid animation on hover */}
            <div className="absolute -bottom-32 left-0 right-0 h-40 bg-[#34BE82]/20 rounded-full filter blur-md transform translate-y-0 group-hover:-translate-y-10 transition-transform duration-700 ease-in-out"></div>
            
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#34BE82]/10 to-[#2F86A6]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-[#3341551a]">
              {/* Water drop icon effect */}
              <div className="absolute top-0 right-0 w-6 h-6 bg-white/30 rounded-full transform scale-0 group-hover:scale-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700 delay-300"></div>
              <object type="image/svg+xml" data="/assets/icons/savings-goal.svg" width={32} height={32} className="w-10 h-10" aria-label="Savings goals"></object>
            </div>
            <h3 className="text-[#0F172A] text-xl font-bold mb-4 text-center relative z-10 group-hover:text-[#34BE82] transition-colors duration-300">Savings Goals</h3>
            <p className="text-[#0F172A] text-center relative z-10">
              Create personalized savings goals with progress tracking, milestone celebrations, and smart recommendations.
            </p>
            <div className="mt-8 flex justify-center relative z-10">
              <Link href="/features" className="text-[#34BE82] font-medium hover:text-[#2F86A6] transition-all duration-300 flex items-center">
                <span>Learn more</span>
                <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
              </Link>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="relative bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 overflow-hidden">
            {/* Enhanced border effects */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#3341551a]"></div>
            <div className="absolute inset-0 rounded-2xl border border-[#3341551a] group-hover:border-[#F2F013]/30 transition-all duration-500"></div>
            
            {/* Water-like border animations */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F2F013] opacity-70 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#F2F013] opacity-50 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#34BE82] opacity-50 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-600 delay-100"></div>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#34BE82] opacity-50 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-600 delay-300"></div>
            
            {/* Liquid animation on hover */}
            <div className="absolute -bottom-32 left-0 right-0 h-40 bg-[#F2F013]/20 rounded-full filter blur-md transform translate-y-0 group-hover:-translate-y-10 transition-transform duration-700 ease-in-out"></div>
            
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#F2F013]/10 to-[#34BE82]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-[#3341551a]">
              {/* Water drop icon effect */}
              <div className="absolute top-0 right-0 w-6 h-6 bg-white/30 rounded-full transform scale-0 group-hover:scale-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-700 delay-300"></div>
              <object type="image/svg+xml" data="/assets/icons/ai-brain.svg" width={32} height={32} className="w-10 h-10" aria-label="AI insights"></object>
            </div>
            <h3 className="text-[#0F172A] text-xl font-bold mb-4 text-center relative z-10 group-hover:text-[#7A7A00] transition-colors duration-300">AI Insights</h3>
            <p className="text-[#0F172A] text-center relative z-10">
              Get personalized financial insights and recommendations based on your spending habits and financial goals.
            </p>
            <div className="mt-8 flex justify-center relative z-10">
              <Link href="/features" className="text-[#7A7A00] font-medium hover:text-[#34BE82] transition-all duration-300 flex items-center">
                <span>Learn more</span>
                <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Testimonial Section - with water/liquid design - full width */}
        <div className="relative py-16 mb-16 overflow-hidden full-width-container">
          {/* Water-themed background */}
          <div className="absolute inset-0 z-0 w-screen">
            {/* Layered water effect background with animated wave - full width */}
            <svg className="absolute inset-0 w-screen h-full overflow-visible" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 320" style={{left: "0", right: "0", width: "100vw", maxWidth: "100vw"}}>
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2F86A6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#34BE82" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#F2F013" stopOpacity="0.8" />
                </linearGradient>
                <filter id="turbulence" x="0" y="0" width="100%" height="100%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="3" seed="1" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#waterGradient)" filter="url(#turbulence)" />
              
              {/* First wave animation covering full width */}
              <path 
                className="animate-wave-slow"
                fill="#2F86A6" 
                fillOpacity="0.4"
                d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,186.7C672,203,768,213,864,202.7C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
                <animate 
                  attributeName="d" 
                  dur="15s" 
                  repeatCount="indefinite" 
                  values="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,186.7C672,203,768,213,864,202.7C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                          M0,160L48,165.3C96,171,192,181,288,176C384,171,480,149,576,144C672,139,768,149,864,165.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                          M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,186.7C672,203,768,213,864,202.7C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                />
              </path>
              
              {/* Second wave animation - different speed and phase */}
              <path 
                className="animate-wave-medium" 
                fill="#34BE82" 
                fillOpacity="0.3"
                d="M0,224L48,213.3C96,203,192,181,288,176C384,171,480,181,576,197.3C672,213,768,235,864,240C960,245,1056,235,1152,218.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
                <animate 
                  attributeName="d" 
                  dur="10s" 
                  repeatCount="indefinite" 
                  values="M0,224L48,213.3C96,203,192,181,288,176C384,171,480,181,576,197.3C672,213,768,235,864,240C960,245,1056,235,1152,218.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                          M0,256L48,245.3C96,235,192,213,288,202.7C384,192,480,192,576,208C672,224,768,256,864,261.3C960,267,1056,245,1152,229.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                          M0,224L48,213.3C96,203,192,181,288,176C384,171,480,181,576,197.3C672,213,768,235,864,240C960,245,1056,235,1152,218.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                />
              </path>
              
              {/* Third wave animation - faster and smaller */}
              <path 
                className="animate-wave-fast" 
                fill="#F2F013" 
                fillOpacity="0.2"
                d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,224C672,235,768,245,864,250.7C960,256,1056,256,1152,245.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
                <animate 
                  attributeName="d" 
                  dur="7s" 
                  repeatCount="indefinite" 
                  values="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,224C672,235,768,245,864,250.7C960,256,1056,256,1152,245.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                          M0,256L48,261.3C96,267,192,277,288,282.7C384,288,480,288,576,272C672,256,768,224,864,208C960,192,1056,192,1152,202.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                          M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,224C672,235,768,245,864,250.7C960,256,1056,256,1152,245.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                />
              </path>
            </svg>
            
            {/* Liquid bubble elements - distributed across the full width */}
            <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 animate-float-slow filter blur-md"></div>
            <div className="absolute top-[15%] left-[30%] w-36 h-36 rounded-full bg-gradient-to-br from-[#2F86A6]/8 to-[#34BE82]/8 animate-float-medium filter blur-md"></div>
            <div className="absolute top-[20%] right-[30%] w-24 h-24 rounded-full bg-gradient-to-bl from-[#2FDD92]/12 to-[#F2F013]/8 animate-float-slower filter blur-md"></div>
            <div className="absolute top-[10%] right-[10%] w-28 h-28 rounded-full bg-gradient-to-tr from-[#34BE82]/8 to-[#F2F013]/8 animate-float-medium filter blur-xl"></div>
            <div className="absolute bottom-[20%] left-[10%] w-40 h-40 rounded-full bg-gradient-to-tr from-[#34BE82]/10 to-[#2F86A6]/10 animate-float-medium filter blur-md"></div>
            <div className="absolute bottom-[30%] left-[35%] w-32 h-32 rounded-full bg-gradient-to-bl from-[#2F86A6]/8 to-[#F2F013]/8 animate-float-slow filter blur-lg"></div>
            <div className="absolute bottom-[15%] right-[35%] w-36 h-36 rounded-full bg-gradient-to-tr from-[#34BE82]/10 to-[#F2F013]/10 animate-float-slower filter blur-xl"></div>
            <div className="absolute bottom-[10%] right-[10%] w-28 h-28 rounded-full bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 animate-float-slow filter blur-md"></div>
            
            {/* Water droplet effects - distributed across full width */}
            <div className="absolute top-[30%] left-[15%] w-3 h-3 rounded-full bg-black/30 animate-ping"></div>
            <div className="absolute top-[25%] left-[45%] w-4 h-4 rounded-full bg-black/30 animate-ping animation-delay-500"></div>
            <div className="absolute top-[40%] right-[25%] w-2 h-2 rounded-full bg-black/30 animate-ping animation-delay-700"></div>
            <div className="absolute bottom-[35%] left-[30%] w-4 h-4 rounded-full bg-black/30 animate-ping animation-delay-1000"></div>
            <div className="absolute bottom-[45%] right-[40%] w-3 h-3 rounded-full bg-black/30 animate-ping animation-delay-1500"></div>
            <div className="absolute bottom-[25%] right-[15%] w-2 h-2 rounded-full bg-black/30 animate-ping animation-delay-2000"></div>
            
            {/* Semi-transparent overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2F86A6]/70 via-[#34BE82]/50 to-[#F2F013]/40 backdrop-blur-sm"></div>
          </div>

        {/* Statements section */}
          <div className="relative z-10 max-w-6xl mx-auto px-8 text-center w-full">
            <h2 className="text-4xl font-bold mb-12 text-white drop-shadow-lg">
              Trusted by Thousands
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="relative bg-gradient-to-br from-[#2F86A6]/20 to-white/10 backdrop-blur-md p-8 rounded-xl max-w-sm shadow-xl hover:shadow-black/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden group">
                {/* Liquid border effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-[#2F86A6]/20"></div>
                <div className="absolute inset-0 rounded-xl border border-white/10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2F86A6] opacity-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#2F86A6] opacity-50 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 opacity-50 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-700 delay-100"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 opacity-50 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-700 delay-300"></div>
                
                {/* Liquid animation on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2F86A6]/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -bottom-32 left-0 right-0 h-40 bg-[#2F86A6]/20 rounded-full filter blur-md transform translate-y-0 group-hover:-translate-y-16 transition-transform duration-700 ease-in-out"></div>
                
                {/* Water droplet rating */}
                <div className="mb-6 text-center relative">
                  <div className="inline-flex space-x-1">
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#2F86A6] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#2F86A6] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#2F86A6] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#2F86A6] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#2F86A6] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="italic mb-4 text-white relative">"BudgetMaster helped me save for my first home in half the time I expected. The visual goals feature kept me motivated."</p>
                <p className="font-semibold text-[#2F86A6] relative">— Sarah T., Homeowner</p>
              </div>
              
              <div className="relative bg-gradient-to-br from-[#34BE82]/20 to-white/10 backdrop-blur-md p-8 rounded-xl max-w-sm shadow-xl hover:shadow-black/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden group">
                {/* Liquid border effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-[#34BE82]/20"></div>
                <div className="absolute inset-0 rounded-xl border border-white/10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#34BE82] opacity-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#34BE82] opacity-50 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 opacity-50 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-700 delay-100"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 opacity-50 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-700 delay-300"></div>
                
                {/* Liquid animation on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#34BE82]/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -bottom-32 left-0 right-0 h-40 bg-[#34BE82]/20 rounded-full filter blur-md transform translate-y-0 group-hover:-translate-y-16 transition-transform duration-700 ease-in-out"></div>
                
                {/* Water droplet rating */}
                <div className="mb-6 text-center relative">
                  <div className="inline-flex space-x-1">
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#0e830a] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#0e830a] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#0e830a] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#0e830a] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#0e830a] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                   
                  </div>
                </div>
                <p className="italic mb-4 text-white relative">"Finally a budget app that doesn't make me feel guilty! The AI insights actually helped me find $300 in monthly savings."</p>
                <p className="font-semibold text-[#0e830a] relative">— Michael K., Entrepreneur</p>
              </div>

              <div className="relative bg-gradient-to-br from-[#F2F013]/20 to-white/10 backdrop-blur-md p-8 rounded-xl max-w-sm shadow-xl hover:shadow-black/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden group">
                {/* Liquid border effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-[#F2F013]/20"></div>
                <div className="absolute inset-0 rounded-xl border border-white/10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F2F013] opacity-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#F2F013] opacity-50 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 opacity-50 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-700 delay-100"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 opacity-50 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-700 delay-300"></div>
                
                {/* Liquid animation on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F2F013]/20 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -bottom-32 left-0 right-0 h-40 bg-[#F2F013]/20 rounded-full filter blur-md transform translate-y-0 group-hover:-translate-y-16 transition-transform duration-700 ease-in-out"></div>
                
                {/* Water droplet rating */}
                <div className="mb-6 text-center relative">
                  <div className="inline-flex space-x-1">
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#F2F013] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#F2F013] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#F2F013] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#F2F013] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 bg-[#F2F013] rounded-full opacity-70"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white/80 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="italic mb-4 text-white relative">"The budget forecasting feature is incredible! I can finally see months ahead and plan for big expenses without any surprises."</p>
                <p className="font-semibold text-[#F2F013] relative">— Jamie R., Financial Analyst</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}