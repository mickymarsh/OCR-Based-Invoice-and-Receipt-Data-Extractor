"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import Navbar from "../../components/navbar";
import Footer from "@/components/Footer";

// Animation keyframes for modern UI elements
const animationStyles = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  .gradient-border {
    position: relative;
    border-radius: 12px;
    z-index: 0;
    overflow: hidden;
  }
  
  .gradient-border::before {
    content: '';
    position: absolute;
    top: -2px; right: -2px; bottom: -2px; left: -2px;
    z-index: -1;
    background: linear-gradient(120deg, #2F86A6, #34BE82, #2FDD92, #F2F013, #2F86A6);
    background-size: 200% auto;
    animation: shimmer 4s linear infinite;
    border-radius: 14px;
  }
`;

export default function UserTransactions() {
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(""); // "receipts" or "invoices"
  const [editingData, setEditingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all", "receipts", or "invoices"

  // Pagination states
  const [receiptsCurrentPage, setReceiptsCurrentPage] = useState(1);
  const [invoicesCurrentPage, setInvoicesCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Add animation styles to document on mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const idToken = await user.getIdToken();

        const invoicesRes = await fetch(
          `http://127.0.0.1:8888/fetch/user/invoices?user_id=${user.uid}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        const receiptsRes = await fetch(
          `http://127.0.0.1:8888/fetch/user/receipts?user_id=${user.uid}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );

        const invoicesData = await invoicesRes.json();
        const receiptsData = await receiptsRes.json();

        setInvoices(invoicesData || []);
        setReceipts(receiptsData || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Pagination functions for receipts
  const getCurrentReceipts = () => {
    const startIndex = (receiptsCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return receipts.slice(startIndex, endIndex);
  };

  const getTotalReceiptPages = () => {
    return Math.ceil(receipts.length / itemsPerPage);
  };

  const handleReceiptsPageChange = (page) => {
    setReceiptsCurrentPage(page);
  };

  // Pagination functions for invoices
  const getCurrentInvoices = () => {
    const startIndex = (invoicesCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return invoices.slice(startIndex, endIndex);
  };

  const getTotalInvoicePages = () => {
    return Math.ceil(invoices.length / itemsPerPage);
  };

  const handleInvoicesPageChange = (page) => {
    setInvoicesCurrentPage(page);
  };

  // Reset pagination when tab changes
  useEffect(() => {
    setReceiptsCurrentPage(1);
    setInvoicesCurrentPage(1);
  }, [activeTab]);

  const handleEdit = (item, type) => {
    const id = type === "receipts" ? item.order_id : item.invoice_number;
    setEditingId(id);
    setEditingType(type);
    setEditingData({ ...item });
  };

  const handleChange = (field, value) => {
    setEditingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || !editingId || !editingType) return;

    try {
      const idToken = await user.getIdToken();
      const payload = { ...editingData };

      if (editingType === "invoices" && payload.due_date) {
        payload.due_date = new Date(payload.due_date).toISOString();
      }
      if (editingType === "receipts" && payload.date) {
        payload.date = new Date(payload.date).toISOString();
      }

      const baseUrl =
        editingType === "invoices"
          ? `http://127.0.0.1:8888/fetch/edit/invoices?invoice_number=${editingId}&user_id=${user.uid}`
          : `http://127.0.0.1:8888/fetch/edit/receipts?order_id=${editingId}&user_id=${user.uid}`;

      const response = await fetch(baseUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      if (editingType === "invoices") {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.invoice_number === editingId ? { ...editingData } : inv
          )
        );
      } else {
        setReceipts((prev) =>
          prev.map((rec) =>
            rec.order_id === editingId ? { ...editingData } : rec
          )
        );
      }

      setEditingId(null);
      setEditingType("");
      setEditingData({});
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving changes. Please try again.");
    }
  };

  const handleDelete = async (type, id) => {
    const user = auth.currentUser;
    if (!user) return;
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const idToken = await user.getIdToken();
      const baseUrl =
        type === "invoices"
          ? `http://127.0.0.1:8888/fetch/delete/invoices?invoice_number=${id}&user_id=${user.uid}`
          : `http://127.0.0.1:8888/fetch/delete/receipts?order_id=${id}&user_id=${user.uid}`;

      const response = await fetch(baseUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      if (type === "invoices") {
        setInvoices((prev) =>
          prev.filter((inv) => inv.invoice_number !== id)
        );
      } else {
        setReceipts((prev) => prev.filter((rec) => rec.order_id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting item. Please try again.");
    }
  };

  const filteredReceipts =
    activeTab === "all" || activeTab === "receipts" ? getCurrentReceipts() : [];
  const filteredInvoices =
    activeTab === "all" || activeTab === "invoices" ? getCurrentInvoices() : [];

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-t-[#2F86A6] border-r-[#34BE82] border-b-[#2FDD92] border-l-transparent rounded-full animate-spin"></div>
          <div className="mt-4 text-xl font-medium bg-gradient-to-r from-[#2F86A6] to-[#34BE82] bg-clip-text text-transparent">Loading transactions...</div>
        </div>
      </div>
    );

  const ButtonIcon = ({ onClick, children, color }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center ${color} text-white p-2 rounded-full hover:scale-105 transition-all duration-200 shadow-md`}
    >
      <span className="select-none text-sm">{children}</span>
    </button>
  );

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange, type }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#2F86A6] to-[#34BE82] text-white hover:shadow-lg hover:scale-105"
          }`}
        >
          Previous
        </button>
        
        <div className="flex space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
                currentPage === page
                  ? "bg-gradient-to-r from-[#2F86A6] to-[#34BE82] text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-[#34BE82] hover:text-[#34BE82]"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#2F86A6] to-[#34BE82] text-white hover:shadow-lg hover:scale-105"
          }`}
        >
          Next
        </button>
        
        <span className="text-sm font-medium bg-gradient-to-r from-[#2F86A6] to-[#34BE82] bg-clip-text text-transparent ml-2">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E4EFE9]">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#2F86A6] to-[#34BE82]">
            Transaction History
          </h1>
          <p className="text-gray-600">Manage your receipts and invoices</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1.5 flex gradient-border">
            {["all", "receipts", "invoices"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-[#2F86A6] to-[#34BE82] text-white shadow-md"
                    : "text-gray-600 hover:text-[#2F86A6]"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Receipts */}
          {(activeTab === "all" || activeTab === "receipts") && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#E4EFE9]/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2F86A6] to-[#34BE82] bg-clip-text text-transparent">Receipts</h2>
                <span className="bg-gradient-to-r from-[#2F86A6]/10 to-[#34BE82]/10 text-[#2F86A6] text-sm px-4 py-1.5 rounded-full font-medium border border-[#2F86A6]/20">
                  {receipts.length} items
                </span>
              </div>

              {filteredReceipts.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-r from-[#2F86A6]/5 to-[#34BE82]/5 rounded-xl">
                  <div className="text-6xl mb-4 animate-pulse">🧾</div>
                  <p className="font-medium text-[#2F86A6]">No receipts available</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {filteredReceipts.map((rec) => (
                      <div
                        key={`receipt-${rec.order_id}`}
                        className="border border-[#E4EFE9] rounded-lg p-4 hover:shadow-md transition-all duration-300 relative bg-white/80 hover:bg-gradient-to-r hover:from-[#2F86A6]/5 hover:to-[#34BE82]/5"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-[#2F86A6]">{rec.seller_name}</h3>
                            <p className="text-sm text-gray-600">Order: <span className="font-medium">{rec.order_id}</span></p>
                            <p className="text-xs text-gray-500 mt-1">
                              Date: {rec.date ? new Date(rec.date).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">Category: {rec.category || 'N/A'}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="bg-gradient-to-r from-[#34BE82]/10 to-[#2FDD92]/10 text-[#34BE82] text-xs px-3 py-1 rounded-full border border-[#34BE82]/20 font-medium">
                              Rs{rec.total_price}
                            </span>

                            {editingId === rec.order_id && editingType === "receipts" ? (
                              <ButtonIcon onClick={handleSave} color="bg-gradient-to-r from-[#34BE82] to-[#2FDD92]">✓</ButtonIcon>
                            ) : (
                              <>
                                <ButtonIcon onClick={() => handleEdit(rec, "receipts")} color="bg-gradient-to-r from-[#2F86A6] to-[#34BE82]">✏️</ButtonIcon>
                                <ButtonIcon onClick={() => handleDelete("receipts", rec.order_id)} color="bg-gradient-to-r from-[#FF5C58] to-[#FF9B6A]">🗑️</ButtonIcon>
                              </>
                            )}
                          </div>
                        </div>

                        {editingId === rec.order_id && editingType === "receipts" && (
                          <div className="space-y-3 mt-3 bg-white/80 p-4 rounded-lg border border-[#E4EFE9]">
                            <div className="text-xs font-medium text-[#2F86A6] mb-2">EDIT RECEIPT</div>
                            <input
                              className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                              value={editingData.order_id || ""}
                              onChange={(e) => handleChange("order_id", e.target.value)}
                              placeholder="Order ID"
                            />
                            <input
                              className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                              value={editingData.seller_name || ""}
                              onChange={(e) => handleChange("seller_name", e.target.value)}
                              placeholder="Seller Name"
                            />
                            <input
                              className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                              type="number"
                              value={editingData.total_price || 0}
                              onChange={(e) => handleChange("total_price", parseFloat(e.target.value))}
                              placeholder="Total Price"
                            />
                            <input
                              className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                              type="date"
                              value={editingData.date ? new Date(editingData.date).toISOString().split("T")[0] : ""}
                              onChange={(e) => handleChange("date", e.target.value)}
                            />
                            <input
                              className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                              value={editingData.category || ""}
                              onChange={(e) => handleChange("category", e.target.value)}
                              placeholder="Category"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Pagination
                    currentPage={receiptsCurrentPage}
                    totalPages={getTotalReceiptPages()}
                    onPageChange={handleReceiptsPageChange}
                    type="receipts"
                  />
                </>
              )}
            </div>
          )}

          {/* Invoices */}
          {(activeTab === "all" || activeTab === "invoices") && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-[#E4EFE9]/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2F86A6] to-[#34BE82] bg-clip-text text-transparent">Invoices</h2>
                <span className="bg-gradient-to-r from-[#2F86A6]/10 to-[#34BE82]/10 text-[#2F86A6] text-sm px-4 py-1.5 rounded-full font-medium border border-[#2F86A6]/20">
                  {invoices.length} items
                </span>
              </div>

              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-r from-[#2F86A6]/5 to-[#34BE82]/5 rounded-xl">
                  <div className="text-6xl mb-4 animate-pulse">📄</div>
                  <p className="font-medium text-[#2F86A6]">No invoices available</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {filteredInvoices.map((inv) => {
                      const dueDate = new Date(inv.due_date);
                      const isPast = dueDate < new Date();
                      return (
                        <div
                          key={`invoice-${inv.invoice_number}`}
                          className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 relative ${
                            isPast 
                              ? "bg-gradient-to-r from-[#FF5C58]/10 to-[#FF9B6A]/10 border-[#FF5C58]/30" 
                              : "bg-white/80 hover:bg-gradient-to-r hover:from-[#2F86A6]/5 hover:to-[#34BE82]/5 border-[#E4EFE9]"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-[#2F86A6]">{inv.seller_name}</h3>
                              <p className="text-sm text-gray-600">Invoice: <span className="font-medium">{inv.invoice_number}</span></p>
                              <p className="text-xs text-gray-500 mt-1">
                                Due Date: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                                {isPast && <span className="text-[#FF5C58] font-medium ml-2">(Past Due)</span>}
                              </p>
                              <p className="text-xs text-gray-500">Category: {inv.category || 'N/A'}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                                isPast 
                                ? "bg-[#FF5C58]/10 text-[#FF5C58] border-[#FF5C58]/20" 
                                : "bg-gradient-to-r from-[#F2F013]/10 to-[#FF9B6A]/10 text-[#FF9B6A] border-[#FF9B6A]/20"
                              }`}>
                                Rs{inv.total_amount}
                              </span>

                              {editingId === inv.invoice_number && editingType === "invoices" ? (
                                <ButtonIcon onClick={handleSave} color="bg-gradient-to-r from-[#34BE82] to-[#2FDD92]">✓</ButtonIcon>
                              ) : (
                                <>
                                  <ButtonIcon onClick={() => handleEdit(inv, "invoices")} color="bg-gradient-to-r from-[#2F86A6] to-[#34BE82]">✏️</ButtonIcon>
                                  <ButtonIcon onClick={() => handleDelete("invoices", inv.invoice_number)} color="bg-gradient-to-r from-[#FF5C58] to-[#FF9B6A]">🗑️</ButtonIcon>
                                </>
                              )}
                            </div>
                          </div>

                          {editingId === inv.invoice_number && editingType === "invoices" && (
                            <div className="space-y-3 mt-3 bg-white/80 p-4 rounded-lg border border-[#E4EFE9]">
                              <div className="text-xs font-medium text-[#2F86A6] mb-2">EDIT INVOICE</div>
                              <input
                                className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                                value={editingData.invoice_number || ""}
                                onChange={(e) => handleChange("invoice_number", e.target.value)}
                                placeholder="Invoice #"
                              />
                              <input
                                className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                                value={editingData.seller_name || ""}
                                onChange={(e) => handleChange("seller_name", e.target.value)}
                                placeholder="Seller Name"
                              />
                              <input
                                className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                                type="number"
                                value={editingData.total_amount || 0}
                                onChange={(e) => handleChange("total_amount", parseFloat(e.target.value))}
                                placeholder="Total Amount"
                              />
                              <input
                                className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                                type="date"
                                value={editingData.due_date ? new Date(editingData.due_date).toISOString().split("T")[0] : ""}
                                onChange={(e) => handleChange("due_date", e.target.value)}
                              />
                              <input
                                className="w-full px-3 py-2 bg-white border border-[#E4EFE9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F86A6] transition-all"
                                value={editingData.category || ""}
                                onChange={(e) => handleChange("category", e.target.value)}
                                placeholder="Category"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <Pagination
                    currentPage={invoicesCurrentPage}
                    totalPages={getTotalInvoicePages()}
                    onPageChange={handleInvoicesPageChange}
                    type="invoices"
                  />
                </>
              )}
            </div>
          )}
        </div>
        
      </div>
      <Footer />
    </div>
  );
}