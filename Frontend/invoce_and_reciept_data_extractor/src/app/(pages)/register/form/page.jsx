"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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
  
  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    console.log("=== SUBMIT BUTTON CLICKED ===");
    
    const user = auth.currentUser;
    console.log("Firebase user object:", user);
    
    if (!user) {
      console.error("No user found - not signed up yet!");
      alert("Not signed up yet!");
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
      console.log("Data types:", {
        uid: typeof requestData.uid,
        signup_at: typeof requestData.signup_at,
        name: typeof requestData.name,
        nic_number: typeof requestData.nic_number,
        gender: typeof requestData.gender,
        marital_status: typeof requestData.marital_status,
        home_town: typeof requestData.home_town,
        birthday: typeof requestData.birthday,
        occupation: typeof requestData.occupation,
        monthly_salary: typeof requestData.monthly_salary,
        average_expenses_per_month: typeof requestData.average_expenses_per_month,
        average_expenses_per_year: typeof requestData.average_expenses_per_year,
        family_member_count: typeof requestData.family_member_count,
        email: typeof requestData.email,
        cluster_id: typeof requestData.cluster_id
      });

      console.log("Sending request to backend...");
      console.log("URL: http://127.0.0.1:8000/auth/setup-profile");
      console.log("Authorization header present:", !!idToken);

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
      console.error("Error stack:", error.stack);
    
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Network error: Could not connect to the server. Make sure your backend is running on http://127.0.0.1:8000");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      console.log("=== SUBMIT PROCESS COMPLETED ===");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-800 text-white p-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Step 2: Complete Your Profile</h1>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Personal Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-blue-400 border-b border-blue-400 pb-1">Personal Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">NIC Number *</label>
            <input
              name="nic_number"
              value={formData.nic_number}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter NIC number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Marital Status *</label>
            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Home Town *</label>
            <input
              name="home_town"
              value={formData.home_town}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter home town"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Birthday *</label>
            <input
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Family Members *</label>
            <input
              name="family_member_count"
              type="number"
              value={formData.family_member_count}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Number of family members"
              min="1"
              required
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-green-400 border-b border-green-400 pb-1">Financial Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Occupation *</label>
            <input
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter occupation"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monthly Salary (LKR) *</label>
            <input
              name="monthly_salary"
              type="number"
              value={formData.monthly_salary}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter monthly salary"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Avg Monthly Expenses (LKR)</label>
            <input
              name="average_expenses_per_month"
              type="number"
              value={formData.average_expenses_per_month}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Optional"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Avg Yearly Expenses (LKR)</label>
            <input
              name="average_expenses_per_year"
              type="number"
              value={formData.average_expenses_per_year}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Optional"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Optional email"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 px-8 py-3 rounded text-lg font-medium hover:bg-green-700 transition-colors mb-12"
      >
        Save & Continue to Dashboard
      </button>

      {/* Step Progress Indicator - Step 2 is active */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-8">
          {/* Step 1 - Completed */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-600 border-4 border-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="mt-2 text-sm font-medium text-green-400">Create Account</span>
          </div>
          
          {/* Step 2 - Current/Active */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-600 border-4 border-blue-400 flex items-center justify-center">
              <span className="font-bold text-white">2</span>
            </div>
            <span className="mt-2 text-sm font-medium text-blue-400">Complete Profile</span>
          </div>
          
          
        </div>
        
        {/* Connecting line */}
        <div className="absolute top-6 left-14 right-14 h-0.5 bg-gray-500 -z-10"></div>
      </div>
    </div>
  );
}