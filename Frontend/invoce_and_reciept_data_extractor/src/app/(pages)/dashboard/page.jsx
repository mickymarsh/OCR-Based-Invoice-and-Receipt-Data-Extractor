"use client";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/navbar";
import { useState } from "react";
import { useRouter } from 'next/navigation';

const ExpenseCard = ({ title, amount, icon, color, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`${color} backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg`}
    >
      <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold text-blue-100">Rs. {amount}</p>
    </button>
  );
};

const ExpenseRow = ({ date, name, category, amount, categoryColor }) => {
  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
      <td className="py-4 px-4 text-blue-100">{date}</td>
      <td className="py-4 px-4 text-white font-medium">{name}</td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
          {category}
        </span>
      </td>
      <td className="py-4 px-4 text-white font-semibold">Rs. {amount}</td>
    </tr>
  );
};

export default function Dashboard() {
  const userName = "Maduni"; // You can replace with actual user data later
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  // Sample data - replace with actual data from your backend
  const totalExpenses = 18225.00;
  const expectedExpenses = 45000.00; // Monthly budget/expected expenses
  const categoryExpenses = {
    food: 4835.00,        // Grocery Shopping (2,685) + Restaurant Dinner (2,150)
    transport: 2100.00,   // Gas Station (1,350) + Bus Pass (750)
    utilities: 3840.00,   // Electricity Bill (3,840)
    entertainment: 1200.00, // Netflix Subscription (1,200)
    shopping: 4750.00,    // Online Shopping (4,750)
    healthcare: 2500.00   // Doctor Visit (2,500)
  };

  const recentExpenses = [
    { date: "2025-09-07", name: "Grocery Shopping", category: "Food", amount: "2,685.00", categoryColor: "bg-green-600/20 text-green-300" },
    { date: "2025-09-06", name: "Gas Station", category: "Transport", amount: "1,350.00", categoryColor: "bg-blue-600/20 text-blue-300" },
    { date: "2025-09-06", name: "Netflix Subscription", category: "Entertainment", amount: "1,200.00", categoryColor: "bg-purple-600/20 text-purple-300" },
    { date: "2025-09-05", name: "Electricity Bill", category: "Utilities", amount: "3,840.00", categoryColor: "bg-yellow-600/20 text-yellow-300" },
    { date: "2025-09-05", name: "Restaurant Dinner", category: "Food", amount: "2,150.00", categoryColor: "bg-green-600/20 text-green-300" },
    { date: "2025-09-04", name: "Online Shopping", category: "Shopping", amount: "4,750.00", categoryColor: "bg-pink-600/20 text-pink-300" },
    { date: "2025-09-04", name: "Doctor Visit", category: "Healthcare", amount: "2,500.00", categoryColor: "bg-red-600/20 text-red-300" },
    { date: "2025-09-03", name: "Bus Pass", category: "Transport", amount: "750.00", categoryColor: "bg-blue-600/20 text-blue-300" }
  ];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // You can add filtering logic here
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
      {/* Falling Stars Background - Same as home page */}
      <div className="absolute inset-0 overflow-hidden">
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
        
        {/* Background glow orbs */}
        <div className="absolute top-20 left-[20%] w-80 h-80 bg-purple-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute top-40 left-[60%] w-72 h-72 bg-blue-500/8 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-40 left-[40%] w-64 h-64 bg-cyan-400/5 rounded-full filter blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Dashboard Header */}
        <div className="pt-8 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Hi, {userName}!
                </h1>
                <p className="text-xl text-blue-100">
                  Welcome to your expense dashboard. Track and manage your spending.
                </p>
              </div>
              
              {/* Add Receipt/Invoice Button */}
              <div className="mt-6 md:mt-0">
                <button 
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/30 flex items-center space-x-3 group"
                  onClick={() => {
                    // Navigate to document upload page
                    router.push('/doc_upload');
                  }}
                >
                  <span className="text-lg">📄</span>
                  <span>Add Receipt/Invoice</span>
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="px-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Actual Expenses */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-white">Total Expenses</h2>
                  <p className="text-4xl font-bold text-blue-100">Rs. {totalExpenses.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</p>
                  <p className="text-blue-200">Spent this month</p>
                </div>
                
                {/* Expected Expenses */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-white">Expected Expenses</h2>
                  <p className="text-4xl font-bold text-emerald-100">Rs. {expectedExpenses.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</p>
                  <div className="flex items-center space-x-4">
                    <p className="text-emerald-200">Monthly budget</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((totalExpenses / expectedExpenses) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-300">
                        {((totalExpenses / expectedExpenses) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="mt-6 pt-6 border-t border-gray-600/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${totalExpenses <= expectedExpenses ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="text-white font-medium">
                      {totalExpenses <= expectedExpenses 
                        ? 'On track with budget' 
                        : 'Over budget'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">Remaining</p>
                    <p className={`font-semibold ${expectedExpenses - totalExpenses >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                      Rs. {Math.abs(expectedExpenses - totalExpenses).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Categories Grid */}
        <div className="px-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">Expense Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <ExpenseCard
                title="Food"
                amount={categoryExpenses.food.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                icon="🍔"
                color="bg-green-800/40"
                onClick={() => handleCategoryClick('food')}
              />
              <ExpenseCard
                title="Transport"
                amount={categoryExpenses.transport.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                icon="🚗"
                color="bg-blue-800/40"
                onClick={() => handleCategoryClick('transport')}
              />
              <ExpenseCard
                title="Utilities"
                amount={categoryExpenses.utilities.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                icon="⚡"
                color="bg-yellow-800/40"
                onClick={() => handleCategoryClick('utilities')}
              />
              <ExpenseCard
                title="Entertainment"
                amount={categoryExpenses.entertainment.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                icon="🎬"
                color="bg-purple-800/40"
                onClick={() => handleCategoryClick('entertainment')}
              />
              <ExpenseCard
                title="Shopping"
                amount={categoryExpenses.shopping.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                icon="🛍️"
                color="bg-pink-800/40"
                onClick={() => handleCategoryClick('shopping')}
              />
              <ExpenseCard
                title="Healthcare"
                amount={categoryExpenses.healthcare.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                icon="🏥"
                color="bg-red-800/40"
                onClick={() => handleCategoryClick('healthcare')}
              />
            </div>
          </div>
        </div>

        {/* Recent Expenses Table */}
        <div className="px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">Latest Expenses</h2>
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/30">
                    <tr>
                      <th className="py-4 px-4 text-left text-white font-semibold">Date</th>
                      <th className="py-4 px-4 text-left text-white font-semibold">Expense Name</th>
                      <th className="py-4 px-4 text-left text-white font-semibold">Category</th>
                      <th className="py-4 px-4 text-left text-white font-semibold">Amount</th>
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
  );
}