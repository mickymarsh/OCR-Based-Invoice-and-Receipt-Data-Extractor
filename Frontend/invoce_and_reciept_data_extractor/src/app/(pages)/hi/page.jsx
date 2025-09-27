"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import Navbar from "../../components/navbar";

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

  const Footer = () => {
  return (
    <footer className="bottom-0 left-0 right-0 text-center text-xs text-white bg-gray-900 py-2 border-t border-blue-800 z-10">
      <p>© {new Date().getFullYear()} Smart Invoice and Receipt Scanner. All rights reserved.</p>
      <p className="mt-1 text-white/80">Secure authentication powered by Firebase</p>
    </footer>
  );
};

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
          `http://127.0.0.1:8000/fetch/user/invoices?user_id=${user.uid}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        const receiptsRes = await fetch(
          `http://127.0.0.1:8000/fetch/user/receipts?user_id=${user.uid}`,
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
          ? `http://127.0.0.1:8000/fetch/edit/invoices?invoice_number=${editingId}&user_id=${user.uid}`
          : `http://127.0.0.1:8000/fetch/edit/receipts?order_id=${editingId}&user_id=${user.uid}`;

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
          ? `http://127.0.0.1:8000/fetch/delete/invoices?invoice_number=${id}&user_id=${user.uid}`
          : `http://127.0.0.1:8000/fetch/delete/receipts?order_id=${id}&user_id=${user.uid}`;

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading transactions...</div>
      </div>
    );

  const ButtonIcon = ({ onClick, children, color }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center ${color} text-white p-2 rounded-md hover:opacity-90 transition-opacity`}
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
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>
        
        <div className="flex space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
        
        <span className="text-sm text-blue-800 ml-2">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 ">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-900">
            Transaction History
          </h1>
          <p className="text-blue-900">Manage your receipts and invoices</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 flex">
            {["all", "receipts", "invoices"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "text-blue-800 hover:text-blue-900"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Receipts</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {receipts.length} items
                </span>
              </div>

              {filteredReceipts.length === 0 ? (
                <div className="text-center py-8 text-blue-500">
                  <div className="text-6xl mb-4">🧾</div>
                  <p>No receipts available</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {filteredReceipts.map((rec) => (
                      <div
                        key={`receipt-${rec.order_id}`}
                        className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow relative bg-white/70"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-blue-900">{rec.seller_name}</h3>
                            <p className="text-sm text-blue-700">Order: {rec.order_id}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Date: {rec.date ? new Date(rec.date).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">Category: {rec.category || 'N/A'}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="bg-teal-50 text-teal-800 text-xs px-2 py-1 rounded-full">
                              Rs{rec.total_price}
                            </span>

                            {editingId === rec.order_id && editingType === "receipts" ? (
                              <ButtonIcon onClick={handleSave} color="bg-green-500">✓</ButtonIcon>
                            ) : (
                              <>
                                <ButtonIcon onClick={() => handleEdit(rec, "receipts")} color="bg-blue-500">✏️</ButtonIcon>
                                <ButtonIcon onClick={() => handleDelete("receipts", rec.order_id)} color="bg-red-500">🗑️</ButtonIcon>
                              </>
                            )}
                          </div>
                        </div>

                        {editingId === rec.order_id && editingType === "receipts" && (
                          <div className="space-y-3 mt-3">
                            <input
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editingData.order_id || ""}
                              onChange={(e) => handleChange("order_id", e.target.value)}
                              placeholder="Order ID"
                            />
                            <input
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={editingData.seller_name || ""}
                              onChange={(e) => handleChange("seller_name", e.target.value)}
                              placeholder="Seller Name"
                            />
                            <input
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              type="number"
                              value={editingData.total_price || 0}
                              onChange={(e) => handleChange("total_price", parseFloat(e.target.value))}
                              placeholder="Total Price"
                            />
                            <input
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              type="date"
                              value={editingData.date ? new Date(editingData.date).toISOString().split("T")[0] : ""}
                              onChange={(e) => handleChange("date", e.target.value)}
                            />
                            <input
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Invoices</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {invoices.length} items
                </span>
              </div>

              {filteredInvoices.length === 0 ? (
                <div className="text-center py-8 text-blue-500">
                  <div className="text-6xl mb-4">📄</div>
                  <p>No invoices available</p>
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
                          className={`border rounded-lg p-4 hover:shadow-md transition-shadow relative ${
                            isPast ? "bg-red-100 border-red-200" : "bg-white/70 border-blue-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-blue-900">{inv.seller_name}</h3>
                              <p className="text-sm text-blue-700">Invoice: {inv.invoice_number}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Due Date: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                                {isPast && <span className="text-red-600 ml-2">(Past Due)</span>}
                              </p>
                              <p className="text-xs text-gray-600">Category: {inv.category || 'N/A'}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${isPast ? "bg-red-200 text-red-800" : "bg-orange-100 text-orange-800"}`}>
                                Rs{inv.total_amount}
                              </span>

                              {editingId === inv.invoice_number && editingType === "invoices" ? (
                                <ButtonIcon onClick={handleSave} color="bg-green-500">✓</ButtonIcon>
                              ) : (
                                <>
                                  <ButtonIcon onClick={() => handleEdit(inv, "invoices")} color="bg-blue-500">✏️</ButtonIcon>
                                  <ButtonIcon onClick={() => handleDelete("invoices", inv.invoice_number)} color="bg-red-500">🗑️</ButtonIcon>
                                </>
                              )}
                            </div>
                          </div>

                          {editingId === inv.invoice_number && editingType === "invoices" && (
                            <div className="space-y-3 mt-3">
                              <input
                                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingData.invoice_number || ""}
                                onChange={(e) => handleChange("invoice_number", e.target.value)}
                                placeholder="Invoice #"
                              />
                              <input
                                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingData.seller_name || ""}
                                onChange={(e) => handleChange("seller_name", e.target.value)}
                                placeholder="Seller Name"
                              />
                              <input
                                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="number"
                                value={editingData.total_amount || 0}
                                onChange={(e) => handleChange("total_amount", parseFloat(e.target.value))}
                                placeholder="Total Amount"
                              />
                              <input
                                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="date"
                                value={editingData.due_date ? new Date(editingData.due_date).toISOString().split("T")[0] : ""}
                                onChange={(e) => handleChange("due_date", e.target.value)}
                              />
                              <input
                                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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