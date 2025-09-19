"use client";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const userName = "Maduni";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  const totalExpenses = 18225.0;
  const expectedExpenses = 45000.0;
  const categoryExpenses = {
    food: 4835.0,
    transport: 2100.0,
    utilities: 3840.0,
    entertainment: 1200.0,
    shopping: 4750.0,
    healthcare: 2500.0,
  };

  const recentExpenses = [
    {
      date: "2025-09-07",
      name: "Grocery Shopping",
      category: "Food",
      amount: "2,685.00",
      categoryColor: "bg-[#34BE82]/15 text-[#0F172A]",
    },
    {
      date: "2025-09-06",
      name: "Gas Station",
      category: "Transport",
      amount: "1,350.00",
      categoryColor: "bg-[#2F86A6]/15 text-[#2F86A6]",
    },
    {
      date: "2025-09-06",
      name: "Netflix Subscription",
      category: "Entertainment",
      amount: "1,200.00",
      categoryColor: "bg-purple-500/10 text-purple-700",
    },
    {
      date: "2025-09-05",
      name: "Electricity Bill",
      category: "Utilities",
      amount: "3,840.00",
      categoryColor: "bg-[#F2F013]/15 text-[#7A7A00]",
    },
    {
      date: "2025-09-05",
      name: "Restaurant Dinner",
      category: "Food",
      amount: "2,150.00",
      categoryColor: "bg-[#34BE82]/15 text-[#0F172A]",
    },
    {
      date: "2025-09-04",
      name: "Online Shopping",
      category: "Shopping",
      amount: "4,750.00",
      categoryColor: "bg-pink-500/10 text-pink-700",
    },
    {
      date: "2025-09-04",
      name: "Doctor Visit",
      category: "Healthcare",
      amount: "2,500.00",
      categoryColor: "bg-red-500/10 text-red-700",
    },
    {
      date: "2025-09-03",
      name: "Bus Pass",
      category: "Transport",
      amount: "750.00",
      categoryColor: "bg-[#2F86A6]/15 text-[#2F86A6]",
    },
  ];

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
          <div className="pt-8 px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#2F86A6] via-[#34BE82] to-[#2FDD92] bg-clip-text mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Hi, {userName}!
                  </h1>
                  <p className="text-xl text-[#334155] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Total Expenses</h2>
                    <p className="text-5xl font-black text-transparent bg-gradient-to-r from-[#2F86A6] to-[#34BE82] bg-clip-text" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Rs. {totalExpenses.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[#2F86A6] font-semibold text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Spent this month</p>
                  </div>

                  {/* Expected Expenses */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Expected Expenses</h2>
                    <p className="text-5xl font-black text-transparent bg-gradient-to-r from-[#34BE82] to-[#2FDD92] bg-clip-text" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Rs. {expectedExpenses.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center space-x-6">
                      <p className="text-[#34BE82] font-semibold text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Monthly budget</p>
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
                        {totalExpenses <= expectedExpenses ? "On track with budget ✨" : "Over budget ⚠️"}
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
              <h2 className="text-3xl font-black text-[#0F172A] mb-8 tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>Expense Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <button
                  onClick={() => handleCategoryClick("food")}
                  className="category-food backdrop-blur-0 p-6 rounded-2xl border border-[#3341551a] text-center transition-all duration-300 transform relative overflow-hidden group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:bg-white/20 transition-colors duration-300">
                    <span className="text-2xl">🍔</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-white transition-colors duration-300">Food</h3>
                  <p className="text-2xl font-black text-[#2F86A6] group-hover:text-white transition-colors duration-300">Rs. {categoryExpenses.food.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => handleCategoryClick("transport")}
                  className="category-transport backdrop-blur-0 p-6 rounded-2xl border border-[#3341551a] text-center transition-all duration-300 transform relative overflow-hidden group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:bg-white/20 transition-colors duration-300">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-white transition-colors duration-300">Transport</h3>
                  <p className="text-2xl font-black text-[#2F86A6] group-hover:text-white transition-colors duration-300">Rs. {categoryExpenses.transport.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => handleCategoryClick("utilities")}
                  className="category-utilities backdrop-blur-0 p-6 rounded-2xl border border-[#3341551a] text-center transition-all duration-300 transform relative overflow-hidden group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:bg-white/20 transition-colors duration-300">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-white transition-colors duration-300">Utilities</h3>
                  <p className="text-2xl font-black text-[#2F86A6] group-hover:text-white transition-colors duration-300">Rs. {categoryExpenses.utilities.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => handleCategoryClick("entertainment")}
                  className="category-entertainment backdrop-blur-0 p-6 rounded-2xl border border-[#3341551a] text-center transition-all duration-300 transform relative overflow-hidden group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:bg-white/20 transition-colors duration-300">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-white transition-colors duration-300">Entertainment</h3>
                  <p className="text-2xl font-black text-[#2F86A6] group-hover:text-white transition-colors duration-300">Rs. {categoryExpenses.entertainment.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => handleCategoryClick("shopping")}
                  className="category-shopping backdrop-blur-0 p-6 rounded-2xl border border-[#3341551a] text-center transition-all duration-300 transform relative overflow-hidden group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:bg-white/20 transition-colors duration-300">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-white transition-colors duration-300">Shopping</h3>
                  <p className="text-2xl font-black text-[#2F86A6] group-hover:text-white transition-colors duration-300">Rs. {categoryExpenses.shopping.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
                
                <button
                  onClick={() => handleCategoryClick("healthcare")}
                  className="category-healthcare backdrop-blur-0 p-6 rounded-2xl border border-[#3341551a] text-center transition-all duration-300 transform relative overflow-hidden group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3341551a] group-hover:bg-white/20 transition-colors duration-300">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <h3 className="text-[#0F172A] text-xl font-bold mb-2 tracking-wide group-hover:text-white transition-colors duration-300">Healthcare</h3>
                  <p className="text-2xl font-black text-[#2F86A6] group-hover:text-white transition-colors duration-300">Rs. {categoryExpenses.healthcare.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                </button>
              </div>
            </div>
          </div>

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
                      {recentExpenses.map((expense, index) => (
                        <ExpenseRow
                          key={index}
                          date={expense.date}
                          name={expense.name}
                          category={expense.category}
                          amount={expense.amount}
                          categoryColor={expense.categoryColor}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}