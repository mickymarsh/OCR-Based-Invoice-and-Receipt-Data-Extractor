"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// Animated Background Component (same as signup page)
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-95"></div>
      
      {/* Animated shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600 rounded-full mix-blend-soft-light filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-soft-light filter blur-xl opacity-20 animate-bounce delay-700"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-700 rounded-full mix-blend-soft-light filter blur-xl opacity-25 animate-ping delay-1000"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
    </div>
  );
};

// Footer Component (same as signup page)
const Footer = () => {
  return (
    <footer className="fixed bottom-4 left-0 right-0 text-center text-xs text-gray-400">
      <p>© {new Date().getFullYear()} Smart Invoice and Receipt Scanner. All rights reserved.</p>
      <p className="mt-1">Secure authentication powered by Firebase</p>
    </footer>
  );
};

export default function SignupFormPage() {
  const [formData, setFormData] = useState({
    name: "",
    nic_number: "",
    gender: "",
    marital_status: "",
    home_town: "",
    birthday: "",
    occupation: "",
    monthly_salary: "",
    average_expenses_per_month: "",
    average_expenses_per_year: "",
    family_member_count: "",
    email: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    console.log("=== SUBMIT BUTTON CLICKED ===");
    
    const user = auth.currentUser;
    console.log("Firebase user object:", user);
    
    if (!user) {
      console.error("No user found - not signed up yet!");
      alert("Not signed up yet!");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Getting ID token...");
      const idToken = await user.getIdToken();
      console.log("ID token obtained successfully");
      
      // Convert birthday to ISO string (datetime format)
      console.log("Form birthday value:", formData.birthday);
      const birthdayDate = new Date(formData.birthday);
      console.log("Birthday as Date object:", birthdayDate);
      const birthdayISO = birthdayDate.toISOString();
      console.log("Birthday ISO string:", birthdayISO);
      
      // Get current time for signup_at
      const signupAt = new Date().toISOString();
      console.log("Signup at timestamp:", signupAt);

      const requestData = {
        uid: user.uid,
        signup_at: signupAt,
        name: formData.name,
        nic_number: formData.nic_number,
        gender: formData.gender,
        marital_status: formData.marital_status,
        home_town: formData.home_town,
        birthday: birthdayISO,
        occupation: formData.occupation,
        monthly_salary: parseInt(formData.monthly_salary),
        average_expenses_per_month: formData.average_expenses_per_month ? parseInt(formData.average_expenses_per_month) : null,
        average_expenses_per_year: formData.average_expenses_per_year ? parseInt(formData.average_expenses_per_year) : null,
        family_member_count: parseInt(formData.family_member_count),
        email: formData.email || user.email,
        cluster_id: null
      };

      console.log("=== FINAL REQUEST DATA ===");
      console.log(JSON.stringify(requestData, null, 2));

      console.log("Sending request to backend...");
      console.log("URL: http://127.0.0.1:8000/auth/setup-profile");

      const response = await fetch("http://127.0.0.1:8000/auth/setup-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);

      if (!response.ok) {
        console.error("Request failed with status:", response.status);
        let errorData;
        try {
          errorData = await response.json();
          console.error("Backend error details:", errorData);
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
          const textError = await response.text();
          console.error("Raw error response:", textError);
          errorData = { message: textError };
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
      }

      const successData = await response.json();
      console.log("✅ SUCCESS - Profile saved:", successData);
      alert("Profile saved successfully!");
      router.push("/dashboard");
      
    } catch (error) {
      console.error("❌ CATCH BLOCK ERROR:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
    
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Network error: Could not connect to the server. Make sure your backend is running on http://127.0.0.1:8000");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
      console.log("=== SUBMIT PROCESS COMPLETED ===");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 py-8 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Main content container */}
      <div className="w-full max-w-4xl bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700/50 z-10 mb-16">
        {/* Header section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-300 to-teal-300 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Step 2: Tell us more about yourself</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-blue-300 border-b border-blue-500/30 pb-2">Personal Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Full Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">NIC Number *</label>
              <input
                name="nic_number"
                value={formData.nic_number}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                placeholder="Enter NIC number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                required
              >
                <option value="" className="bg-gray-800">Select Gender</option>
                <option value="male" className="bg-gray-800">Male</option>
                <option value="female" className="bg-gray-800">Female</option>
                <option value="other" className="bg-gray-800">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Marital Status *</label>
              <select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                required
              >
                <option value="" className="bg-gray-800">Select Status</option>
                <option value="single" className="bg-gray-800">Single</option>
                <option value="married" className="bg-gray-800">Married</option>
                <option value="divorced" className="bg-gray-800">Divorced</option>
                <option value="widowed" className="bg-gray-800">Widowed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Home Town *</label>
              <input
                name="home_town"
                value={formData.home_town}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                placeholder="Enter home town"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Birthday *</label>
              <input
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Family Members *</label>
              <input
                name="family_member_count"
                type="number"
                value={formData.family_member_count}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                placeholder="Number of family members"
                min="1"
                required
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-green-300 border-b border-green-500/30 pb-2">Financial Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Occupation *</label>
              <input
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                placeholder="Enter occupation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Monthly Salary (LKR) *</label>
              <input
                name="monthly_salary"
                type="number"
                value={formData.monthly_salary}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                placeholder="Enter monthly salary"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Avg Monthly Expenses (LKR)</label>
              <input
                name="average_expenses_per_month"
                type="number"
                value={formData.average_expenses_per_month}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                placeholder="Optional"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Avg Yearly Expenses (LKR)</label>
              <input
                name="average_expenses_per_year"
                type="number"
                value={formData.average_expenses_per_year}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                placeholder="Optional"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                placeholder="Optional email"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-8 py-3 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Profile...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save & Continue to Dashboard
              </>
            )}
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-600 border-4 border-green-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="mt-2 text-xs font-medium text-green-400">Create Account</span>
            </div>
            
            <div className="h-0.5 flex-grow bg-gray-600 mx-2"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-blue-400 flex items-center justify-center">
                <span className="font-bold text-sm text-white">2</span>
              </div>
              <span className="mt-2 text-xs font-medium text-blue-400">Complete Profile</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}