"use client";
import { auth } from "@/lib/firebase";
import Navbar from '../../components/navbar';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

const ExpenseRow = ({ date, name, category, amount, categoryColor }) => {
  return (
    <tr className="border-b border-[#3341551a] hover:bg-gradient-to-r hover:from-[#2F86A6]/5 hover:to-[#34BE82]/5 transition-all duration-300">
      <td className="py-3 sm:py-5 px-4 sm:px-6 text-[#2F86A6] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{date}</td>
      <td className="py-3 sm:py-5 px-4 sm:px-6 text-[#0F172A] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{name}</td>
      <td className="py-3 sm:py-5 px-4 sm:px-6">
        <span
          className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider ${categoryColor} border border-[#3341551a]`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {category}
        </span>
      </td>
      <td className="py-3 sm:py-5 px-4 sm:px-6 text-[#0F172A] font-black text-base sm:text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Rs. {amount}</td>
    </tr>
  );
};

export default function AllExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
  const [selectedCategory, setSelectedCategory] = useState('All'); // Default to show all categories
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Category color mapping
  const categoryColors = {
    Food: "bg-[#34BE82]/15 text-[#0F172A]",
    Transport: "bg-[#2F86A6]/15 text-[#2F86A6]",
    Utilities: "bg-[#F2F013]/15 text-[#7A7A00]",
    Entertainment: "bg-purple-500/10 text-purple-700",
    Shopping: "bg-pink-500/10 text-pink-700",
    Healthcare: "bg-red-500/10 text-red-700",
  };
  
  // Available categories including 'All'
  const categories = ['All', ...Object.keys(categoryColors)];

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Array of years for the dropdown (from 2020 to current year)
  const years = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, i) => 2020 + i
  );

  // ✅ Listen to Firebase authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        router.push('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Fetch expenses when userId, selectedMonth or selectedYear changes
  useEffect(() => {
    if (!userId) return;
    
    fetchExpenses();
  }, [userId, selectedMonth, selectedYear]);
  
  // Apply category filter when expenses or selectedCategory changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredExpenses(expenses);
    } else {
      const filtered = expenses.filter(expense => expense.category === selectedCategory);
      setFilteredExpenses(filtered);
    }
  }, [expenses, selectedCategory]);

  // Function to fetch expenses by month
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/get/receipts/${userId}/by-month?month=${selectedMonth}&year=${selectedYear}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched expenses:", data);
      
      if (data.receipts) {
        // Format receipts for the table
        const formatted = data.receipts.map((r, index) => ({
          date: new Date(r.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          name: `Expense ${index + 1}`, // Default name since backend doesn't provide names
          category: r.category,
          amount: parseFloat(r.total_price).toLocaleString("en-LK", { minimumFractionDigits: 2 }),
          categoryColor: categoryColors[r.category] || "bg-gray-500/10 text-gray-700",
        }));
        
        setExpenses(formatted);
        // Initially set filtered expenses to all expenses
        setFilteredExpenses(formatted);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(`Failed to fetch expenses: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };
  
  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
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
          <div className="pt-4 sm:pt-6 md:pt-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 md:mb-8">
                <div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-[#2F86A6] via-[#34BE82] to-[#2FDD92] bg-clip-text mb-2 sm:mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                    All Expenses
                  </h1>
                  <p className="text-lg sm:text-xl text-[#334155] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                    View and filter all your expenses by month.
                  </p>
                </div>

                {/* Back to Dashboard Button */}
                <div className="mt-4 sm:mt-6 md:mt-0">
                  <button
                    className="bg-gradient-to-r from-[#2F86A6] via-[#34BE82] to-[#2FDD92] text-white font-bold px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 sm:space-x-4 group transform hover:scale-105 border border-[#ffffff80]"
                    onClick={() => router.push("/dashboard")}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <svg
                      className="w-6 h-6 group-hover:-translate-x-2 transition-transform duration-300 rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="text-base sm:text-lg tracking-wide">Back to Dashboard</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Month Filter */}
          <div className="px-4 md:px-8 mb-4 sm:mb-6 md:mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/80 p-4 sm:p-6 rounded-xl sm:rounded-3xl border border-[#3341551a] shadow-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-3 sm:mb-4">Filter Expenses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {/* Month selector */}
                  <div>
                    <label htmlFor="month-select" className="block text-sm font-medium text-[#334155] mb-2">
                      Month
                    </label>
                    <select
                      id="month-select"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      className="w-full bg-white text-black border border-[#3341551a] rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F86A6] focus:border-transparent transition-all duration-300"
                    >
                      {monthNames.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year selector */}
                  <div>
                    <label htmlFor="year-select" className="block text-sm font-medium text-[#334155] mb-2">
                      Year
                    </label>
                    <select
                      id="year-select"
                      value={selectedYear}
                      onChange={handleYearChange}
                      className="w-full bg-white border text-black border-[#3341551a] rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F86A6] focus:border-transparent transition-all duration-300"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Category selector */}
                  <div>
                    <label htmlFor="category-select" className="block text-sm font-medium text-[#334155] mb-2">
                      Category
                    </label>
                    <select
                      id="category-select"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="w-full bg-white text-black border border-[#3341551a] rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F86A6] focus:border-transparent transition-all duration-300"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="px-2 sm:px-4 md:px-8 pb-8 sm:pb-12 md:pb-16">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-4 sm:mb-6 md:mb-8 tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                {selectedCategory !== 'All' ? selectedCategory : ''} Expenses - {monthNames[selectedMonth - 1]} {selectedYear}
              </h2>
              
              {loading ? (
                <div className="bg-white/90 rounded-xl sm:rounded-3xl border border-[#3341551a] p-8 sm:p-12 shadow-xl flex justify-center">
                  <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-t-2 border-b-2 border-[#2F86A6]"></div>
                </div>
              ) : error ? (
                <div className="bg-white/90 rounded-xl sm:rounded-3xl border border-[#3341551a] p-6 sm:p-12 shadow-xl text-center">
                  <p className="text-red-600 font-medium">{error}</p>
                  <button 
                    onClick={fetchExpenses}
                    className="mt-4 bg-[#2F86A6] text-white py-2 px-4 rounded-lg hover:bg-[#34BE82] transition-colors duration-300"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="bg-white/90 rounded-xl sm:rounded-3xl border border-[#3341551a] overflow-hidden shadow-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <div className="overflow-x-auto -mx-1 px-1">
                    <table className="min-w-[500px] w-full">
                      <thead className="bg-gradient-to-r from-[#2F86A6]/10 to-[#34BE82]/10">
                        <tr>
                          <th className="py-6 px-6 text-left text-[#0F172A] font-black text-lg tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Date</th>
                          <th className="py-6 px-6 text-left text-[#0F172A] font-black text-lg tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Expense Name</th>
                          <th className="py-6 px-6 text-left text-[#0F172A] font-black text-lg tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Category</th>
                          <th className="py-6 px-6 text-left text-[#0F172A] font-black text-lg tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.length > 0 ? (
                          filteredExpenses.map((expense, index) => (
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
                              {userId 
                                ? `No ${selectedCategory !== 'All' ? selectedCategory + ' ' : ''}expenses found for ${monthNames[selectedMonth - 1]} ${selectedYear}.`
                                : "Please sign in to view expenses"
                              }
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Summary Information */}
              {filteredExpenses.length > 0 && (
                <div className="mt-4 sm:mt-6 md:mt-8 bg-white/80 p-4 sm:p-6 rounded-xl sm:rounded-3xl border border-[#3341551a] shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <h3 className="text-lg sm:text-xl font-bold text-[#0F172A]">
                      Total {selectedCategory !== 'All' ? selectedCategory : ''} Expenses
                    </h3>
                    <p className="text-xl sm:text-2xl font-black text-[#2F86A6]">
                      Rs. {filteredExpenses
                        .reduce((sum, expense) => {
                          const amount = parseFloat(expense.amount.replace(/,/g, ''));
                          return sum + (isNaN(amount) ? 0 : amount);
                        }, 0)
                        .toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
