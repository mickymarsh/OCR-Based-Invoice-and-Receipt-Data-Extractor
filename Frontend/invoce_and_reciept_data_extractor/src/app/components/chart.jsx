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
} from "recharts";

export default function ReceiptsCharts() {
  const [data, setData] = useState([]);
  const [category, setCategory] = useState("All");
  const [timeView, setTimeView] = useState("Month");
  const [userId, setUserId] = useState(null);

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
          // Store original Date objects for filtering
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

    if (timeView === "Month") {
      // First day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // Week: Get first day of current week (Sunday)
      const day = now.getDay(); // 0 = Sunday
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
    }

    return data
      .filter((d) => (category === "All" ? true : d.category === category))
      .filter((d) => d.originalDate >= startDate && d.originalDate <= now)
      .sort((a, b) => a.originalDate - b.originalDate); // Sort by date ascending
  };

  const filteredData = getFilteredData();

  return (
    <div>
      {!userId && <p>Please sign in to view your charts.</p>}

      {userId && (
        <>
          {/* Category Buttons */}
          <div>
            {[
              "All",
              "Food",
              "Transport",
              "Entertainment",
              "Utilities",
              "Shopping",
              "Healthcare",
            ].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  margin: "5px",
                  background: category === c ? "#82ca9d" : "#ddd",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Time Buttons */}
          <div>
            {["Month", "Week"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeView(t)}
                style={{
                  margin: "5px",
                  background: timeView === t ? "#8884d8" : "#ddd",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Single Line Chart */}
          <LineChart width={700} height={300} data={filteredData}>
            <XAxis 
              dataKey="date" 
              label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis 
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total_price" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#ff7300' }}
            />
          </LineChart>

          {/* Summary Info */}
          <div style={{ marginTop: '20px' }}>
            <p>
              Showing {filteredData.length} transactions for {timeView.toLowerCase()} of{' '}
              {timeView === 'Month' 
                ? new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : 'current week'
              }
              {category !== 'All' && ` in ${category}`}
            </p>
            <p>
              Total spent: ${filteredData.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0).toFixed(2)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}