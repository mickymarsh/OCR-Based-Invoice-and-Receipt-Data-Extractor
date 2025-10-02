"use client";
import { auth } from "@/lib/firebase";
{/*import Navbar from "@components/";*/}
import Navbar from '../../components/navbar';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Chart from "../../components/chart"
import Head from 'next/head';

// Adding styles for liquid animations
const liquidStyles = `
  @keyframes liquidFloat {
    0% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(2deg); }
    50% { transform: translateY(0) rotate(0deg); }
    75% { transform: translateY(10px) rotate(-2deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }

  @keyframes liquidPulse {
    0% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
    100% { opacity: 0.3; transform: scale(1); }
  }

  @keyframes liquidMove {
    0% { transform: translate(0, 0); }
    33% { transform: translate(5px, 10px); }
    66% { transform: translate(-5px, 5px); }
    100% { transform: translate(0, 0); }
  }

  .category-food .absolute,
  .category-transport .absolute,
  .category-utilities .absolute,
  .category-entertainment .absolute,
  .category-shopping .absolute,
  .category-healthcare .absolute {
    animation: liquidPulse 8s infinite;
  }
`;


const ExpenseCard = ({ title, amount, icon, color, onClick }) => {
  // Extract base color from gradient for hover effect
  const baseColor = color.includes('from-[') 
    ? color.match(/from-\[(.*?)\]/)[1] 
    : color.includes('from-') 
      ? color.match(/from-(.*?)\//)[1] 
      : '#2F86A6';

  return (
    <button
      onClick={onClick}
      className={`${color} backdrop-blur-0 p-6 rounded-2xl border border-[#3341551a] text-center transition-all duration-300 hover:scale-[1.02] transform relative overflow-hidden group`}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
      
      <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:scale-110 transition-transform duration-300">
        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
      </div>
      <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-white transition-colors duration-300 relative z-10">{title}</h3>
      <p className="text-2xl font-black text-[#2F86A6] group-hover:text-white transition-colors duration-300 relative z-10">Rs. {amount}</p>
    </button>
  );
};

const ExpenseRow = ({ date, name, category, amount, categoryColor }) => {
  return (
    <tr className="border-b border-[#3341551a] hover:bg-gradient-to-r hover:from-[#2F86A6]/5 hover:to-[#34BE82]/5 transition-all duration-300">
      <td className="py-5 px-6 text-[#2F86A6] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{date}</td>
      <td className="py-5 px-6 text-[#0F172A] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{name}</td>
      <td className="py-5 px-6">
        <span
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${categoryColor} border border-[#3341551a]`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {category}
        </span>
      </td>
      <td className="py-5 px-6 text-[#0F172A] font-black text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Rs. {amount}</td>
    </tr>
  );
};

export default function Dashboard() {
  const [userName, setUserName] = useState("User");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [userId, setUserId] = useState(null);
  const [expectedExpenses, setExpectedExpenses] = useState(45000.0);
  const router = useRouter();
  
  // Add dynamic liquid animation styles
  useEffect(() => {
    // Add the liquid animation styles to the document head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = liquidStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      // Clean up the style element when component unmounts
      document.head.removeChild(styleElement);
    };
  }, []);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();
  
  // Helper function to check if an expense is from the current month
  const isCurrentMonthExpense = (expense) => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth() + 1;
    const expenseYear = expenseDate.getFullYear();
    return expenseMonth === currentMonth && expenseYear === currentYear;
  };
  
  // Calculate total expenses for current month only
  const totalExpenses = recentExpenses.reduce((sum, expense) => {
    if (isCurrentMonthExpense(expense)) {
      const amount = parseFloat(expense.amount.replace(/,/g, ''));
      return sum + (isNaN(amount) ? 0 : amount);
    }
    return sum;
  }, 0);

  // Category expenses for current month only
  const categoryExpenses = {
    food: recentExpenses
      .filter(expense => expense.category === "Food" && isCurrentMonthExpense(expense))
      .reduce((sum, expense) => sum + parseFloat(expense.amount.replace(/,/g, '')), 0),
    transport: recentExpenses
      .filter(expense => expense.category === "Transport" && isCurrentMonthExpense(expense))
      .reduce((sum, expense) => sum + parseFloat(expense.amount.replace(/,/g, '')), 0),
    utilities: recentExpenses
      .filter(expense => expense.category === "Utilities" && isCurrentMonthExpense(expense))
      .reduce((sum, expense) => sum + parseFloat(expense.amount.replace(/,/g, '')), 0),
    entertainment: recentExpenses
      .filter(expense => expense.category === "Entertainment" && isCurrentMonthExpense(expense))
      .reduce((sum, expense) => sum + parseFloat(expense.amount.replace(/,/g, '')), 0),
    shopping: recentExpenses
      .filter(expense => expense.category === "Shopping" && isCurrentMonthExpense(expense))
      .reduce((sum, expense) => sum + parseFloat(expense.amount.replace(/,/g, '')), 0),
    healthcare: recentExpenses
      .filter(expense => expense.category === "Healthcare" && isCurrentMonthExpense(expense))
      .reduce((sum, expense) => sum + parseFloat(expense.amount.replace(/,/g, '')), 0),
  };

  // Category color mapping
  const categoryColors = {
    Food: "bg-[#34BE82]/15 text-[#0F172A]",
    Transport: "bg-[#2F86A6]/15 text-[#2F86A6]",
    Utilities: "bg-[#F2F013]/15 text-[#7A7A00]",
    Entertainment: "bg-purple-500/10 text-purple-700",
    Shopping: "bg-pink-500/10 text-pink-700",
    Healthcare: "bg-red-500/10 text-red-700",
  };

  // ✅ Listen to Firebase authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // ✅ Fetch user data when userId is available
  useEffect(() => {
    if (!userId) return;
    
    console.log("Fetching user data for:", userId);
    fetch(`http://127.0.0.1:8000/get/user/${userId}`)
      .then((res) => res.json())
      .then((json) => {
        console.log("Fetched user data:", json);
        if (json.user && json.user.name) {
          setUserName(json.user.name);
          console.log("User name set to:", json.user.name);
        }
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        // Fallback to default name if fetch fails
        setUserName("User");
        console.log("User name set to default: User");
      });
  }, [userId]);

  // ✅ Fetch receipts when userId is available
  useEffect(() => {
    if (!userId) return;
    console.log("Fetching receipts for user:", userId);
    fetch(`http://127.0.0.1:8000/get/receipts/${userId}`)
      .then((res) => res.json())
      .then((json) => {
        console.log("Fetched receipts:", json);
        if (json.receipts) {
          // Format receipts for the table
            const formatted = json.receipts.map((r, index) => ({
            date: new Date(r.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            name: r.seller_name || `Expense ${index + 1}`, // Use seller_name if available, fallback to default name
            category: r.category,
            amount: parseFloat(r.total_price).toLocaleString("en-LK", { minimumFractionDigits: 2 }),
            categoryColor: categoryColors[r.category] || "bg-gray-500/10 text-gray-700",
            }));
          setRecentExpenses(formatted);
        }
      })
      .catch((err) => console.error("Error fetching receipts:", err));
  }, [userId]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        /* Enhanced hover effects for category cards */
        .category-food {
          background: linear-gradient(135deg, rgba(52, 190, 130, 0.2), rgba(47, 221, 146, 0.1));
        }
        .category-food:hover {
          background: linear-gradient(135deg, rgba(52, 190, 130, 0.8), rgba(47, 221, 146, 0.6));
          box-shadow: 0 10px 25px rgba(52, 190, 130, 0.3);
        }
        
        .category-transport {
          background: linear-gradient(135deg, rgba(47, 134, 166, 0.2), rgba(52, 190, 130, 0.1));
        }
        .category-transport:hover {
          background: linear-gradient(135deg, rgba(47, 134, 166, 0.8), rgba(52, 190, 130, 0.6));
          box-shadow: 0 10px 25px rgba(47, 134, 166, 0.3);
        }
        
        .category-utilities {
          background: linear-gradient(135deg, rgba(242, 240, 19, 0.25), rgba(242, 240, 19, 0.1));
        }
        .category-utilities:hover {
          background: linear-gradient(135deg, rgba(242, 240, 19, 0.7), rgba(242, 240, 19, 0.4));
          box-shadow: 0 10px 25px rgba(242, 240, 19, 0.3);
        }
        
        .category-entertainment {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.1));
        }
        .category-entertainment:hover {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.7), rgba(147, 51, 234, 0.5));
          box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3);
        }
        
        .category-shopping {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.1));
        }
        .category-shopping:hover {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.7), rgba(219, 39, 119, 0.5));
          box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3);
        }
        
        .category-healthcare {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1));
        }
        .category-healthcare:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.7), rgba(220, 38, 38, 0.5));
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        }
      `}</style>
      
      <main className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-white relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Subtle decorative blobs for light theme */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] w-80 h-80 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full blur-3xl" />
          <div
            className="absolute top-40 right-[15%] w-72 h-72 bg-gradient-to-bl from-[#2FDD92]/12 to-[#F2F013]/8 rounded-full blur-3xl"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-32 left-[30%] w-64 h-64 bg-gradient-to-tr from-[#34BE82]/10 to-[#2F86A6]/10 rounded-full blur-3xl"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* Header */}
                <div className="pt-6 px-6">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-[#2F86A6] via-[#34BE82] to-[#2FDD92] bg-clip-text mb-3 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Hi, {userName}!
                    </h1>
                    <p className="text-lg text-[#334155] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Welcome to your expense dashboard. Track and manage your spending with style.
                    </p>
                  </div>

                  {/* Add Receipt/Invoice Button */}
                <div className="mt-6 md:mt-0">
                  <button
                    className="bg-gradient-to-r from-[#2F86A6] via-[#34BE82] to-[#2FDD92] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-4 group transform hover:scale-105 border border-[#ffffff80]"
                    onClick={() => router.push("/doc_upload")}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <span className="text-xl">📄</span>
                    <span className="text-lg tracking-wide">Add Receipt/Invoice</span>
                    <svg
                      className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Total / Expected */}
          <div className="px-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/80 p-10 rounded-3xl border border-[#3341551a] shadow-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Actual Expenses */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {new Date().toLocaleString('default', { month: 'long' })} Expenses
                    </h2>
                    <p className="text-5xl font-black text-transparent bg-gradient-to-r from-[#2F86A6] to-[#34BE82] bg-clip-text" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Rs. {totalExpenses.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[#2F86A6] font-semibold text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Current month spending</p>
                  </div>

                  {/* Expected Expenses */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Expected Expenses</h2>
                    <p className="text-5xl font-black text-transparent bg-gradient-to-r from-[#34BE82] to-[#2FDD92] bg-clip-text" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Rs. {expectedExpenses.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center space-x-6">
                      <p className="text-[#34BE82] font-semibold text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {new Date().toLocaleString('default', { month: 'long' })} budget
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 h-3 bg-[#E5E7EB] rounded-full overflow-hidden border border-[#3341551a]">
                          <div
                            className="h-full bg-gradient-to-r from-[#2F86A6] via-[#34BE82] to-[#2FDD92] rounded-full transition-all duration-1000 shadow"
                            style={{ width: `${Math.min((totalExpenses / expectedExpenses) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#7A7A00] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {((totalExpenses / expectedExpenses) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-8 pt-8 border-t border-[#3341551a]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-4 h-4 rounded-full ${totalExpenses <= expectedExpenses ? "bg-[#2FDD92]" : "bg-red-500"}`}
                      />
                      <span className="text-[#0F172A] font-bold text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {totalExpenses <= expectedExpenses ? 
                          `On track with ${new Date().toLocaleString('default', { month: 'long' })} budget ✨` : 
                          `Over ${new Date().toLocaleString('default', { month: 'long' })} budget ⚠️`}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#64748B] font-semibold uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Remaining</p>
                      <p
                        className={`font-black text-2xl ${
                          expectedExpenses - totalExpenses >= 0 ? "text-[#2F86A6]" : "text-red-600"
                        }`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Rs. {Math.abs(expectedExpenses - totalExpenses).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="px-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-black text-[#0F172A] mb-8 tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                {new Date().toLocaleString('default', { month: 'long' })} Expense Categories
              </h2>
              <div className="p-6 lg:p-8 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-lg rounded-[2rem] border border-white/50 shadow-xl mb-8 relative overflow-hidden">
                {/* Liquid background effects */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2F86A6]/20 to-[#34BE82]/20 rounded-full blur-xl"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#34BE82]/10 to-[#2F86A6]/10 rounded-full blur-xl"></div>
                </div>
                {/* Main content */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
                <button
                  onClick={() => router.push(`/allExpenses?category=Food`)}
                  className="category-food p-6 rounded-3xl border border-[#3341551a] text-center transform relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-white via-white to-white/70 backdrop-blur-md"
                >
                  {/* Liquid bubble effect */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#2F86A6]/20 to-[#34BE82]/20 group-hover:scale-150 transition-all duration-700 ease-in-out blur-md"></div>
                  <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-gradient-to-tr from-[#34BE82]/10 to-[#2F86A6]/10 group-hover:scale-150 transition-all duration-500 ease-in-out blur-md delay-100"></div>
                  
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-500 relative z-10">🍔</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-[#2F86A6] transition-colors duration-300 relative z-10">Food</h3>
                  <p className="text-xs text-[#334155] font-medium mb-1 transition-colors duration-300 relative z-10">{new Date().toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-2xl font-black text-[#2F86A6] relative z-10 group-hover:scale-110 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(47,134,166,0.5)]">Rs. {categoryExpenses.food.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => router.push(`/allExpenses?category=Transport`)}
                  className="category-transport p-6 rounded-3xl border border-[#3341551a] text-center transform relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-white via-white to-white/70 backdrop-blur-md"
                >
                  {/* Liquid bubble effect */}
                  <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-[#34BE82]/20 to-[#2F86A6]/20 group-hover:scale-150 transition-all duration-700 ease-in-out blur-md"></div>
                  <div className="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#2F86A6]/10 to-[#34BE82]/10 group-hover:scale-150 transition-all duration-500 ease-in-out blur-md delay-100"></div>
                  
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-500 relative z-10">🚗</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-[#2F86A6] transition-colors duration-300 relative z-10">Transport</h3>
                  <p className="text-xs text-[#334155] font-medium mb-1 transition-colors duration-300 relative z-10">{new Date().toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-2xl font-black text-[#2F86A6] relative z-10 group-hover:scale-110 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(47,134,166,0.5)]">Rs. {categoryExpenses.transport.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => router.push(`/allExpenses?category=Utilities`)}
                  className="category-utilities p-6 rounded-3xl border border-[#3341551a] text-center transform relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-white via-white to-white/70 backdrop-blur-md"
                >
                  {/* Liquid bubble effect */}
                  <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full bg-gradient-to-br from-[#2F86A6]/20 to-[#34BE82]/20 group-hover:scale-150 transition-all duration-700 ease-in-out blur-md"></div>
                  <div className="absolute -top-5 -left-5 w-24 h-24 rounded-full bg-gradient-to-tr from-[#34BE82]/10 to-[#2F86A6]/10 group-hover:scale-150 transition-all duration-500 ease-in-out blur-md delay-100"></div>
                  
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-500 animate-bounce relative z-10">⚡</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-[#2F86A6] transition-colors duration-300 relative z-10">Utilities</h3>
                  <p className="text-xs text-[#334155] font-medium mb-1 transition-colors duration-300 relative z-10">{new Date().toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-2xl font-black text-[#2F86A6] relative z-10 group-hover:scale-110 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(47,134,166,0.5)]">Rs. {categoryExpenses.utilities.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => router.push(`/allExpenses?category=Entertainment`)}
                  className="category-entertainment p-6 rounded-3xl border border-[#3341551a] text-center transform relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-white via-white to-white/70 backdrop-blur-md"
                >
                  {/* Liquid bubble effect */}
                  <div className="absolute -bottom-10 left-0 w-32 h-32 rounded-full bg-gradient-to-br from-[#2F86A6]/20 to-[#34BE82]/20 group-hover:scale-150 transition-all duration-700 ease-in-out blur-md"></div>
                  <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-gradient-to-tr from-[#34BE82]/10 to-[#2F86A6]/10 group-hover:scale-150 transition-all duration-500 ease-in-out blur-md delay-100"></div>
                  
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-500 relative z-10">🎬</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-[#2F86A6] transition-colors duration-300 relative z-10">Entertainment</h3>
                  <p className="text-xs text-[#334155] font-medium mb-1 transition-colors duration-300 relative z-10">{new Date().toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-2xl font-black text-[#2F86A6] relative z-10 group-hover:scale-110 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(47,134,166,0.5)]">Rs. {categoryExpenses.entertainment.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => router.push(`/allExpenses?category=Shopping`)}
                  className="category-shopping p-6 rounded-3xl border border-[#3341551a] text-center transform relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-white via-white to-white/70 backdrop-blur-md"
                >
                  {/* Liquid bubble effect */}
                  <div className="absolute top-0 left-0 w-36 h-36 rounded-full bg-gradient-to-br from-[#2F86A6]/20 to-[#34BE82]/20 group-hover:scale-150 transition-all duration-700 ease-in-out blur-md"></div>
                  <div className="absolute -bottom-5 right-0 w-32 h-32 rounded-full bg-gradient-to-tr from-[#34BE82]/10 to-[#2F86A6]/10 group-hover:scale-150 transition-all duration-500 ease-in-out blur-md delay-100"></div>
                  
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-500 relative z-10">🛍️</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-[#2F86A6] transition-colors duration-300 relative z-10">Shopping</h3>
                  <p className="text-xs text-[#334155] font-medium mb-1 transition-colors duration-300 relative z-10">{new Date().toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-2xl font-black text-[#2F86A6] relative z-10 group-hover:scale-110 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(47,134,166,0.5)]">Rs. {categoryExpenses.shopping.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => router.push(`/allExpenses?category=Healthcare`)}
                  className="category-healthcare p-6 rounded-3xl border border-[#3341551a] text-center transform relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-white via-white to-white/70 backdrop-blur-md"
                >
                  {/* Liquid bubble effect */}
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-gradient-to-br from-[#2F86A6]/20 to-[#34BE82]/20 group-hover:scale-150 transition-all duration-700 ease-in-out blur-md"></div>
                  <div className="absolute -top-8 -left-8 w-36 h-36 rounded-full bg-gradient-to-tr from-[#34BE82]/10 to-[#2F86A6]/10 group-hover:scale-150 transition-all duration-500 ease-in-out blur-md delay-100"></div>
                  
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-500 relative z-10">🏥</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-[#2F86A6] transition-colors duration-300 relative z-10">Healthcare</h3>
                  <p className="text-xs text-[#334155] font-medium mb-1 transition-colors duration-300 relative z-10">{new Date().toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-2xl font-black text-[#2F86A6] relative z-10 group-hover:scale-110 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(47,134,166,0.5)]">Rs. {categoryExpenses.healthcare.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                </div>
              </div>
            </div>
          </div>

          <Chart></Chart>

          {/* Table */}
          <div className="px-8 pb-16">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-black text-[#0F172A] mb-8 tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Latest Expenses</h2>
              <div className="bg-white/90 rounded-3xl border border-[#3341551a] overflow-hidden shadow-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#2F86A6]/10 to-[#34BE82]/10">
                      <tr>
                        <th className="py-6 px-6 text-left text-[#0F172A] font-black text-lg tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Date</th>
                        <th className="py-6 px-6 text-left text-[#0F172A] font-black text-lg tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Expense Name</th>
                        <th className="py-6 px-6 text-left text-[#0F172A] font-black text-lg tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Category</th>
                        <th className="py-6 px-6 text-left text-[#0F172A] font-black text-lg tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.length > 0 ? (
                        recentExpenses
                          .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending (most recent first)
                          .slice(0, 15) // Show only latest 15
                          .map((expense, index) => (
                            <ExpenseRow
                              key={index}
                              date={expense.date}
                              name={expense.name}
                              category={expense.category}
                              amount={expense.amount}
                              categoryColor={expense.categoryColor}
                            />
                          ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-[#64748B] font-medium">
                            {userId ? "No expenses found. Add your first receipt!" : "Please sign in to view expenses"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {recentExpenses.length > 15 && (
            <div className="px-8 mb-8">
              <div className="max-w-7xl mx-auto">
                <div className="py-6 text-center">
                  <button
                    className="text-[#2F86A6] font-bold underline hover:text-[#34BE82] transition-colors duration-200"
                    onClick={() => router.push("/allExpenses")}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    See all expenses
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}