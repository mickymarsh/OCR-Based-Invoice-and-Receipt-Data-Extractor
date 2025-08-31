"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { FaUser, FaCalendarAlt, FaHistory, FaEnvelope, FaKey, FaMoneyBill, FaHome, FaUsers, FaVenusMars, FaRing, FaBriefcase } from "react-icons/fa";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [resetStatus, setResetStatus] = useState({ message: "", type: "" });
  const [saveStatus, setSaveStatus] = useState({ message: "", type: "" });
  const [signInHistory, setSignInHistory] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (user) {
        const uid = user.uid;
        const docRef = doc(db, "User", uid);

        try {
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setEditableData(data);
            
            // Get sign-in history (last 5 sign-ins)
            if (user.metadata && user.metadata.lastSignInTime) {
              const history = [
                { timestamp: new Date(user.metadata.lastSignInTime), provider: "Email" },
                { timestamp: new Date(user.metadata.creationTime), provider: "Email" }
              ];
              setSignInHistory(history);
            }
          } else {
            console.warn("No such document for UID:", uid);
          }
        } catch (err) {
          console.error("Firestore fetch error:", err);
        }
      } else {
        console.warn("No user is logged in");
      }
    };

    fetchUserData();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditableData(userData);
    }
    setIsEditing(!isEditing);
    setSaveStatus({ message: "", type: "" });
  };

  const handleInputChange = (field, value) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "User", user.uid);
      await updateDoc(userRef, editableData);
      
      setUserData(editableData);
      setIsEditing(false);
      setSaveStatus({ message: "Profile updated successfully!", type: "success" });
      
      setTimeout(() => {
        setSaveStatus({ message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating document:", error);
      setSaveStatus({ message: "Failed to update profile. Please try again.", type: "error" });
    }
  };

  const handlePasswordReset = async () => {
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      setResetStatus({ 
        message: "No user is logged in or user doesn't have an email", 
        type: "error" 
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetStatus({ 
        message: "Password reset email sent! Check your inbox.", 
        type: "success" 
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setResetStatus({ 
        message: `Failed to send reset email: ${error.message}`, 
        type: "error" 
      });
    }
  };

  const handleImageUpload = async (e) => {
    // This would typically upload to Firebase Storage
    // For simplicity, we're just setting a local state
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderField = (field, label, type = "text") => {
  // Check if this field should not be editable
  const isNonEditableField = field === "average_expenses_per_month" || field === "average_expenses_per_year";
  
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide uppercase text-xs">
        {label}
      </label>
      {isEditing && !isNonEditableField ? (
        <input
          type={type}
          value={editableData[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-750 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-450 focus:border-blue-450 transition-colors duration-200"
        />
      ) : (
        <div className={`px-4 py-2.5 bg-gray-800 rounded-lg text-gray-200 border border-gray-700 ${isNonEditableField && isEditing ? 'cursor-not-allowed opacity-70' : ''}`}>
          {userData[field] !== null && userData[field] !== undefined 
            ? userData[field].toString() 
            : "Still calculating"}
        </div>
      )}
    </div>
  );
};

  if (!userData) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-lg font-light">Loading profile...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white py-9 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">User Profile</h1>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleEditToggle}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={handleEditToggle}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {saveStatus.message && (
          <div className={`mb-6 py-3 px-4 rounded-lg ${
            saveStatus.type === "success" 
              ? "bg-emerald-900/30 text-emerald-200 border border-emerald-800/50" 
              : "bg-red-900/30 text-red-200 border border-red-800/50"
          }`}>
            {saveStatus.message}
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Picture Column */}
              <div className="lg:w-1/4 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-blue-500 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-5xl text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  )}
                </div>
                
                {isUploading && (
                  <div className="text-blue-400 mb-4">Uploading image...</div>
                )}
                
                {/* Sign In History */}
                <div className="w-full mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FaHistory className="mr-2 text-blue-400" />
                    Sign-In History
                  </h3>
                  <div className="space-y-3">
                    {signInHistory.length > 0 ? (
                      signInHistory.map((session, index) => (
                        <div key={index} className="bg-gray-750 p-3 rounded-lg border border-gray-600">
                          <div className="text-sm text-gray-300">
                            {session.timestamp.toLocaleDateString()} at {session.timestamp.toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Via {session.provider}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-sm">No sign-in history available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Columns */}
              <div className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* First Column: Personal Details */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-gray-700 flex items-center">
                    <FaUser className="mr-2 text-blue-400" />
                    Personal Details
                  </h2>
                  
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide uppercase text-xs flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-400" />
                      Birthday
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editableData.birthday ? editableData.birthday.toDate().toISOString().split('T')[0] : ""}
                        onChange={(e) => handleInputChange("birthday", new Date(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-750 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-450 focus:border-blue-450 transition-colors duration-200"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-800 rounded-lg text-gray-200 border border-gray-700">
                        {userData.birthday ? userData.birthday.toDate().toLocaleDateString() : "Still calculating..."}
                      </div>
                    )}
                  </div>

                  {renderField("gender", "Gender", "text", <FaVenusMars className="text-blue-400" />)}
                  {renderField("marital_status", "Marital Status", "text", <FaRing className="text-blue-400" />)}
                  {renderField("family_member_count", "Family Members", "number", <FaUsers className="text-blue-400" />)}
                  {renderField("home_town", "Home Town", "text", <FaHome className="text-blue-400" />)}
                </div>

                {/* Second Column: Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-gray-700 flex items-center">
                    <FaEnvelope className="mr-2 text-blue-400" />
                    Personal Information
                  </h2>
                  
                  {renderField("name", "Full Name", "text", <FaUser className="text-blue-400" />)}
                  {renderField("email", "Email Address", "email", <FaEnvelope className="text-blue-400" />)}
                  
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide uppercase text-xs flex items-center">
                      <FaKey className="mr-2 text-blue-400" />
                      Password
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="px-4 py-2.5 bg-gray-800 rounded-lg text-gray-400 border border-gray-700 flex-1">
                        ••••••••
                      </div>
                      <button 
                        onClick={handlePasswordReset}
                        className="px-4 py-2.5 bg-red-900/40 hover:bg-red-900/60 text-red-200 font-medium rounded-lg transition-all duration-200 border border-red-800/50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50 whitespace-nowrap"
                      >
                        Reset
                      </button>
                    </div>
                    
                    {resetStatus.message && (
                      <div className={`mt-3 py-2 px-3 rounded-md ${
                        resetStatus.type === "success" 
                          ? "bg-emerald-900/30 text-emerald-200 border border-emerald-800/50" 
                          : "bg-red-900/30 text-red-200 border border-red-800/50"
                      }`}>
                        {resetStatus.message}
                      </div>
                    )}
                  </div>

                  {renderField("nic_number", "NIC Number")}
                  {renderField("occupation", "Occupation", "text", <FaBriefcase className="text-blue-400" />)}
                </div>

                {/* Third Column: Financial Information */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-gray-700 flex items-center">
                    <FaMoneyBill className="mr-2 text-blue-400" />
                    Financial Information
                  </h2>
                  
                  {renderField("monthly_salary", "Monthly Salary", "number", <FaMoneyBill className="text-blue-400" />)}
                  {renderField("average_expenses_per_month", "Monthly Expenses", "number", <FaMoneyBill className="text-blue-400" />)}
                  {renderField("average_expenses_per_year", "Yearly Expenses", "number", <FaMoneyBill className="text-blue-400" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}