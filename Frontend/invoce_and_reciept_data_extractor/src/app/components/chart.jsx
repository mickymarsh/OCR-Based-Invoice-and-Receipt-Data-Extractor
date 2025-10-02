"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function ReceiptsCharts() {
  const [data, setData] = useState([]);
  const [category, setCategory] = useState("All");
  const [timeView, setTimeView] = useState("CurrentMonth"); // ✅ Default is Current Month
  const [userId, setUserId] = useState(null);

  // Category colors matching the dashboard
  const categoryColors = {
    Food: "#34BE82",
    Transport: "#2F86A6",
    Utilities: "#F2F013",
    Entertainment: "#A855F7",
    Shopping: "#EC4899",
    Healthcare: "#EF4444",
    All: "#8884d8"
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

  // ✅ Fetch receipts when userId is available
  useEffect(() => {
    if (!userId) return;
    fetch(`http://127.0.0.1:8000/get/receipts/${userId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.receipts) {
          const formatted = json.receipts.map((r) => ({
            ...r,
            originalDate: new Date(r.date), // Store as Date object for filtering
            date: new Date(r.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          }));
          setData(formatted);
        }
      })
      .catch((err) => console.error("Error fetching receipts:", err));
  }, [userId]);

  // ✅ Filter data by category and time period
  const getFilteredData = () => {
    const now = new Date();
    let startDate;
    let endDate = now;

    if (timeView === "CurrentMonth") {
      // First day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeView === "LastMonth") {
      // First and last day of previous month
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0); // last day of last month
    } else if (timeView === "CurrentWeek") {
      // Get first day of current week (Sunday)
      const day = now.getDay(); // 0 = Sunday
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
    }

    return data
      .filter((d) => (category === "All" ? true : d.category === category))
      .filter((d) => d.originalDate >= startDate && d.originalDate <= endDate)
      .sort((a, b) => a.originalDate - b.originalDate);
  };

  const filteredData = getFilteredData();
  const totalSpent = filteredData.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-white relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-[10%] w-80 h-80 bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-32 left-[15%] w-72 h-72 bg-gradient-to-bl from-[#2FDD92]/12 to-[#F2F013]/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-8 py-8">
          {!userId && (
            <div className="max-w-7xl mx-auto bg-white/80 p-8 rounded-3xl border border-[#3341551a] shadow-xl text-center">
              <p className="text-xl text-[#0F172A] font-semibold">Please sign in to view your charts</p>
            </div>
          )}

          {userId && (
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <p className="text-xl text-[#334155] font-medium">
                  Visualize your spending patterns and track expenses over time
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                {/* Category Buttons */}
                <div className="flex flex-wrap gap-3">
                  {["All", "Food", "Transport", "Entertainment", "Utilities", "Shopping", "Healthcare"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`
                        px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wide transition-all duration-200
                        ${category === c ? "text-white" : "text-[#0F172A] bg-white/80 hover:bg-white"}
                      `}
                      style={{
                        background: category === c 
                          ? `linear-gradient(135deg, ${categoryColors[c]}, ${categoryColors[c]}CC)`
                          : "rgba(255, 255, 255, 0.8)",
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Time Buttons - Small + Inline */}
                <div className="flex gap-2 bg-white/80 rounded-xl p-1 border border-[#3341551a] shadow-lg">
                  {[
                    { key: "LastMonth", label: "Last Month" },
                    { key: "CurrentMonth", label: "Current Month" },
                    { key: "CurrentWeek", label: "Current Week" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTimeView(t.key)}
                      className={`
                        px-3 py-1.5 rounded-lg font-semibold text-xs uppercase tracking-wide transition-all duration-200
                        ${timeView === t.key
                          ? "text-white bg-gradient-to-r from-[#2F86A6] to-[#34BE82] shadow-md"
                          : "text-[#0F172A] hover:bg-white/50"}
                      `}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white/90 rounded-3xl border border-[#3341551a] shadow-xl p-8 mb-8">
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.7} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748B"
                        fontSize={12}
                        tick={{ fill: '#64748B' }}
                        label={{ value: 'DATE', position: 'insideBottomRight', offset: -10, fill: '#64748B', fontSize: 12, fontWeight: 'bold' }}
                      />
                      <YAxis 
                        stroke="#64748B"
                        fontSize={12}
                        tick={{ fill: '#64748B' }}
                        label={{ value: 'AMOUNT (Rs.)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748B', fontSize: 12, fontWeight: 'bold' }}
                      />
                      <Tooltip 
                        contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #3341551a', borderRadius: '12px', backdropFilter: 'blur(10px)', fontFamily: "'Inter', sans-serif" }}
                        formatter={(value) => [`Rs. ${value}`, 'Amount']}
                      />
                      <Legend wrapperStyle={{ fontFamily: "'Inter', sans-serif", fontWeight: '600' }} />
                      <Line 
                        type="monotone" 
                        dataKey="total_price" 
                        name="Spending"
                        stroke={categoryColors[category]}
                        strokeWidth={4}
                        dot={{ fill: categoryColors[category], strokeWidth: 2, r: 6, stroke: "white" }}
                        activeDot={{ r: 8, fill: "#FF6B35", stroke: "white", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl p-6 border border-[#3341551a] shadow-lg">
                  <div className="text-3xl font-black text-[#2F86A6] mb-2">{filteredData.length}</div>
                  <div className="text-[#0F172A] font-semibold uppercase tracking-wider text-sm">Transactions</div>
                </div>

                <div className="bg-gradient-to-br from-[#34BE82]/10 to-[#2FDD92]/10 rounded-2xl p-6 border border-[#3341551a] shadow-lg">
                  <div className="text-3xl font-black text-[#34BE82] mb-2">Rs. {totalSpent.toFixed(2)}</div>
                  <div className="text-[#0F172A] font-semibold uppercase tracking-wider text-sm">Total Spent</div>
                </div>

                <div className="bg-gradient-to-br from-[#F2F013]/10 to-[#FF6B35]/10 rounded-2xl p-6 border border-[#3341551a] shadow-lg">
                  <div className="text-3xl font-black text-[#7A7A00] mb-2">
                    {timeView === "LastMonth" ? "Last Month" : timeView === "CurrentMonth" ? "Current Month" : "Current Week"}
                  </div>
                  <div className="text-[#0F172A] font-semibold uppercase tracking-wider text-sm">
                    {timeView === "CurrentMonth"
                      ? new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
                      : timeView === "LastMonth"
                        ? new Date(new Date().getFullYear(), new Date().getMonth() - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                        : "This Week"}
                  </div>
                </div>
              </div>

              {/* Summary Text */}
              <div className="mt-6 text-center">
                <p className="text-[#64748B] font-medium">
                  Showing expenses for {timeView === "CurrentMonth" ? "current month" : timeView === "LastMonth" ? "last month" : "current week"}{" "}
                  {timeView === "CurrentMonth"
                    ? `(${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })})`
                    : timeView === "LastMonth"
                      ? `(${new Date(new Date().getFullYear(), new Date().getMonth() - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })})`
                      : ""}
                  {category !== "All" && ` in ${category}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
