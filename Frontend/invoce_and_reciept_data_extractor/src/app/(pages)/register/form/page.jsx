"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { API_BASE } from '@/lib/config';

// Animated Background Component (light theme ocean style)
const AnimatedBackground = () => {

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-white opacity-95"></div>
      
      {/* Animated shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-soft-light filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-300 rounded-full mix-blend-soft-light filter blur-xl opacity-20 animate-bounce delay-700"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-300 rounded-full mix-blend-soft-light filter blur-xl opacity-25 animate-ping delay-1000"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="fixed bottom-4 left-0 right-0 text-center text-xs text-gray-500">
      <p>© {new Date().getFullYear()} Smart Invoice and Receipt Scanner. All rights reserved.</p>
      <p className="mt-1">Secure authentication powered by Firebase</p>
    </footer>
  );
};

export default function SignupFormPage() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    marital_status: "",
    home_town: "", // used as location_type for the model
    birthday: "",
    education_level: "",
    car_ownership: "",
    occupation: "",
    monthly_salary: "",
    average_expenses_per_month: "",
    average_expenses_per_year: "",
    family_member_count: "", // used as num_children for the model
    email: "",
    exercise_frequency: "",
  });
  
  const [clusterPredicted, setClusterPredicted] = useState(false);
  const [clusterId, setClusterId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Function to calculate age from birthday
  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Function to predict cluster ID
  const predictClusterId = async (user, formData) => {
    try {
      const idToken = await user.getIdToken();
      
      // Extract features needed for model prediction
      const predictionData = {
        gender: formData.gender,
        age: formData.birthday ? calculateAge(formData.birthday) : 30, // default age if not provided
        income: parseInt(formData.monthly_salary) || 0,
        education_level: formData.education_level,
        occupation: formData.occupation,
        marital_status: formData.marital_status,
        num_children: parseInt(formData.family_member_count) || 0,
        location_type: formData.home_town, // using home_town as location_type
        exercise_frequency: formData.exercise_frequency,
        car_ownership: formData.car_ownership.toLowerCase() === "yes" ? 1 : 0,
      };
      
      console.log("Prediction data:", predictionData);
      
      const response = await fetch(`${API_BASE}/user/predict-cluster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(predictionData),
      });
      
      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Prediction result:", result);
      
      // Return the predicted cluster ID
      return result.cluster_id;
    } catch (error) {
      console.error("Prediction error:", error);
      // Return null if prediction fails
      return null;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    console.log("=== SUBMIT BUTTON CLICKED ===");
    
    const user = auth.currentUser;
    if (!user) {
      alert("Not signed up yet!");
      setIsLoading(false);
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const birthdayDate = new Date(formData.birthday);
      const birthdayISO = birthdayDate.toISOString();
      const signupAt = new Date().toISOString();
      
      // Predict cluster ID
      const predictedClusterId = await predictClusterId(user, formData);
      
      // Set state with prediction results
      setClusterPredicted(true);
      setClusterId(predictedClusterId);
      
      // Prepare user data with predicted cluster ID
      const requestData = {
        uid: user.uid,
        signup_at: signupAt,
        name: formData.name,
        gender: formData.gender,
        marital_status: formData.marital_status,
        home_town: formData.home_town,
        birthday: birthdayISO,
        education_level: formData.education_level,
        car_ownership: formData.car_ownership,
        occupation: formData.occupation,
        monthly_salary: parseInt(formData.monthly_salary),
        average_expenses_per_month: formData.average_expenses_per_month ? parseInt(formData.average_expenses_per_month) : null,
        average_expenses_per_year: formData.average_expenses_per_year ? parseInt(formData.average_expenses_per_year) : null,
        family_member_count: parseInt(formData.family_member_count),
        email: formData.email || user.email,
        exercise_frequency: formData.exercise_frequency,
        cluster_id: predictedClusterId
      };

      const response = await fetch(`${API_BASE}/auth/setup-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const textError = await response.text();
          errorData = { message: textError };
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
      }

      const successData = await response.json();
      console.log("✅ SUCCESS - Profile saved:", successData);
      alert("Profile saved successfully!");
      router.push("/dashboard");
      
    } catch (error) {
      console.error("❌ Error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Network error: Could not connect to the server.");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 p-4 py-8 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Main content container */}
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200 z-10 mb-16">
        {/* Header section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Step 2: Tell us more about yourself</p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-blue-600 border-b border-blue-300 pb-2">Personal Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Full Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Marital Status *</label>
              <select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                required
              >
                <option value="">Select Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Home Town *</label>
              <select
                name="home_town"
                value={formData.home_town}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                required
              >
                <option value="">Select Status</option>
                <option value="urban">Urban</option>
                <option value="suburban">Suburban</option>
                <option value="rural">Rural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Birthday *</label>
              <input
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Education Level *</label>
              <select
                name="education_level"
                value={formData.education_level}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                required
              >
                <option value="">Select Education Level</option>
                <option value="al">A/L</option>
                <option value="up_to_ol">Up to O/L</option>
                <option value="diploma/tvet">Diploma/TVET</option>
                <option value="bachelor">Bachelor</option>
                <option value="postgraduate">Postgraduate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Car ownership *</label>
              <select
                name="car_ownership"
                value={formData.car_ownership}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                required
              >
                <option value="">Select Status</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Number of children *</label>
              <input
                name="family_member_count"
                type="number"
                value={formData.family_member_count}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                placeholder="Number of children"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Exercise Frequency *</label>
              <select
                name="exercise_frequency"
                value={formData.exercise_frequency}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                required
              >
                <option value="">Select yours</option>
                <option value="1-2/wk">1-2/wk</option>
                <option value="3-5/wk">3-5/wk</option>
                <option value="daily">Daily</option>
                <option value="rarely">Rarely</option>
              </select>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-teal-600 border-b border-teal-300 pb-2">Financial Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Occupation *</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-gray-800"
                required
              >
                <option value="">Select Occupation Level</option>
                <option value="salaried-private">Salaried-Private</option>
                <option value="salaried-public">Salaried-Public</option>
                <option value="self-employed">Self-Employed</option>
                <option value="student">Student</option>
                <option value="gig-parttime">Gig/Part-time</option>
                <option value="small-business">Small Business Owner</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Monthly Salary (LKR) *</label>
              <input
                name="monthly_salary"
                type="number"
                value={formData.monthly_salary}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-gray-800"
                placeholder="Enter monthly salary"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Avg Monthly Expenses (LKR)</label>
              <input
                name="average_expenses_per_month"
                type="number"
                value={formData.average_expenses_per_month}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-gray-800"
                placeholder="Optional"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Avg Yearly Expenses (LKR)</label>
              <input
                name="average_expenses_per_year"
                type="number"
                value={formData.average_expenses_per_year}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-gray-800"
                placeholder="Optional"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-gray-800"
                placeholder="Optional email"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save & Continue to Dashboard
              </>
            )}
          </button>
        </div>

        {/* Cluster Prediction Result */}
        {clusterPredicted && clusterId !== null && (
          <div className="mt-6 pt-4 border-t border-teal-300">
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-xl border border-teal-200">
              <h3 className="font-semibold text-lg text-teal-600 mb-2">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Customer Segment Analysis
                </span>
              </h3>
              <p className="text-gray-700 mb-2">
                Based on your profile information, you've been identified as part of <span className="font-semibold text-blue-600">Customer Cluster {clusterId}</span>
              </p>
              <div className="flex items-center mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-teal-500 to-blue-500" style={{ width: `${(clusterId+1) * 20}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

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
