"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import Navbar from '../../components/navbar';

import {
  FaUser,
  FaCalendarAlt,
  FaHistory,
  FaEnvelope,
  FaKey,
  FaMoneyBill,
} from "react-icons/fa";

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
            if (user.metadata && user.metadata.lastSignInTime) {
              const history = [
                { timestamp: new Date(user.metadata.lastSignInTime), provider: "Email" },
                { timestamp: new Date(user.metadata.creationTime), provider: "Email" },
              ];
              setSignInHistory(history);
            }
          }
        } catch (err) {
          console.error("Firestore fetch error:", err);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) setEditableData(userData);
    setIsEditing(!isEditing);
    setSaveStatus({ message: "", type: "" });
  };

  const handleInputChange = (field, value) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
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
      setTimeout(() => setSaveStatus({ message: "", type: "" }), 3000);
    } catch (error) {
      setSaveStatus({ message: "Failed to update profile.", type: "error" });
    }
  };

  const handlePasswordReset = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      setResetStatus({ message: "No user email found", type: "error" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetStatus({ message: "Password reset email sent!", type: "success" });
    } catch (error) {
      setResetStatus({ message: `Failed: ${error.message}`, type: "error" });
    }
  };

  const handleImageUpload = async (e) => {
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
    const isNonEditableField =
      field === "average_expenses_per_month" || field === "average_expenses_per_year";

    return (
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide uppercase text-xs">
          {label}
        </label>
        {isEditing && !isNonEditableField ? (
          <input
            type={type}
            value={editableData[field] || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        ) : (
          <div
            className={`px-4 py-2.5 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 ${
              isNonEditableField && isEditing ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {userData[field] !== null && userData[field] !== undefined
              ? userData[field].toString()
              : "Still calculating"}
          </div>
        )}
      </div>
    );
  };

  if (!userData)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading profile...</div>
      </div>
    );

  return (
    <>
    <Navbar></Navbar>
    <div className="min-h-screen bg-gray-50 text-gray-800 py-9 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
            User Profile
          </h1>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg shadow-md focus:ring-2 focus:ring-emerald-400"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleEditToggle}
                  className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md focus:ring-2 focus:ring-blue-400"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {saveStatus.message && (
          <div
            className={`mb-6 py-3 px-4 rounded-lg ${
              saveStatus.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                : "bg-red-50 text-red-700 border border-red-300"
            }`}
          >
            {saveStatus.message}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Picture */}
              <div className="lg:w-1/4 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-teal-500 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-5xl text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-600">
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </label>
                  )}
                </div>
                {isUploading && <div className="text-blue-500 mb-4">Uploading image...</div>}

                {/* Sign In History */}
                <div className="w-full mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaHistory className="mr-2 text-blue-500" /> Sign-In History
                  </h3>
                  <div className="space-y-3">
                    {signInHistory.length > 0 ? (
                      signInHistory.map((session, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <div className="text-sm text-gray-700">
                            {session.timestamp.toLocaleDateString()} at {" "}
                            {session.timestamp.toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Via {session.provider}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm">No sign-in history available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Details */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                    <FaUser className="mr-2 text-blue-500" /> Personal Details
                  </h2>
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase text-xs flex items-center">
                      <FaCalendarAlt className="mr-2 text-emerald-500" /> Birthday
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={
                          editableData.birthday
                            ? editableData.birthday.toDate().toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => handleInputChange("birthday", new Date(e.target.value))}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-emerald-400"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-700 border border-gray-200">
                        {userData.birthday
                          ? userData.birthday.toDate().toLocaleDateString()
                          : "Still calculating..."}
                      </div>
                    )}
                  </div>

                  {renderField("gender", "Gender")}
                  {renderField("marital_status", "Marital Status")}
                  {renderField("family_member_count", "Family Members", "number")}
                  {renderField("home_town", "Home Town")}
                </div>

                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                    <FaEnvelope className="mr-2 text-blue-500" /> Personal Information
                  </h2>
                  {renderField("name", "Full Name")}
                  {renderField("email", "Email Address", "email")}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase text-xs flex items-center">
                      <FaKey className="mr-2 text-emerald-500" /> Password
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-500 border border-gray-200 flex-1">
                        ••••••••
                      </div>
                      <button
                        onClick={handlePasswordReset}
                        className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 font-medium rounded-lg border border-red-300"
                      >
                        Reset
                      </button>
                    </div>
                    {resetStatus.message && (
                      <div
                        className={`mt-3 py-2 px-3 rounded-md ${
                          resetStatus.type === "success"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : "bg-red-50 text-red-700 border border-red-300"
                        }`}
                      >
                        {resetStatus.message}
                      </div>
                    )}
                  </div>
                  {renderField("nic_number", "NIC Number")}
                  {renderField("occupation", "Occupation")}
                </div>

                {/* Financial Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                    <FaMoneyBill className="mr-2 text-blue-500" /> Financial Information
                  </h2>
                  {renderField("monthly_salary", "Monthly Salary", "number")}
                  {renderField("average_expenses_per_month", "Monthly Expenses", "number")}
                  {renderField("average_expenses_per_year", "Yearly Expenses", "number")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}