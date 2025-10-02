
import React, { useState } from "react";
import { getAuth } from "firebase/auth";

const invoiceFields = [
  "customer_address", "customer_name", "due_date", "invoice_date", "invoice_number", "invoice_subtotal", "invoice_total",
  "item_description", "item_quantity", "item_total_price", "item_unit_price", "supplier_address", "supplier_name", "tax_amount", "tax_rate"
];

export default function InvoiceSidebar({ data, editing, onEdit, onSave, onDataChange, onClose, expenseType, expenseTypeDropdown }) {
  const [showSummary, setShowSummary] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  // Save invoice data to backend
  const [lastSavedId, setLastSavedId] = useState("");

  // Helper: parse common date formats to ISO string (UTC). If parsing fails, return raw string.
  const parseDateISO = (raw) => {
    if (raw instanceof Date) return raw;
    if (!raw) return '';
    let s = String(raw).trim();
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) return new Date(parsed);
    const dm = s.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2,4})(?:\s+(\d{1,2}:\d{2})(?::\d{2})?)?$/);
    if (dm) {
      let day = dm[1];
      let month = dm[2];
      let year = dm[3];
      const timePart = dm[4] || '00:00';
      if (year.length === 2) year = '20' + year;
      let d = parseInt(day, 10);
      let m = parseInt(month, 10);
      if (m > 12 && d <= 12) {
        [d, m] = [m, d];
      }
      const isoStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${timePart}:00Z`;
      const iso = Date.parse(isoStr);
      if (!isNaN(iso)) return new Date(iso);
    }
    return s;
  };
  // Save to DB after confirmation
  const handleSaveToDB = async () => {
    // Map frontend fields to backend expected fields
    const keyMap = {
      ExpenseType: "category",
      customer_address: "customer_address",
      customer_name: "customer_name",
      due_date: "due_date",
      invoice_number: "invoice_number",
      item_description: "item",
      supplier_address: "seller_address",
      supplier_name: "seller_name",
      sent_email: "sent_email",
      invoice_total: "total_amount",
      uploaded_date: "uploaded_date",
      user_id: "user_id"
    };
    const invoiceData = {};
    Object.entries(keyMap).forEach(([frontendKey, backendKey]) => {
      if (frontendKey === "sent_email") {
        invoiceData[backendKey] = true;
      } else if (frontendKey === "uploaded_date") {
        invoiceData[backendKey] = new Date().toISOString();
      } else if (frontendKey === "user_id") {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        invoiceData[backendKey] = (currentUser && currentUser.uid) ? `/User/${currentUser.uid}` : "";
      } else if (frontendKey === "invoice_total") {
        invoiceData[backendKey] = data[frontendKey] ? parseFloat(data[frontendKey]) || 0 : 0;
      } else if (data[frontendKey] !== undefined) {
        if (frontendKey === 'due_date') {
          // If due_date empty, default to 5 days from now (ISO)
          if (!data[frontendKey]) {
            const fiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
            invoiceData[backendKey] = fiveDays.toISOString();
          } else {
            invoiceData[backendKey] = parseDateISO(data[frontendKey]) || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
          }
        } else {
          invoiceData[backendKey] = data[frontendKey];
        }
      }
    });
    console.log('invoce data',invoiceData);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.doc_id) {
          setLastSavedId(result.doc_id);
          alert('Invoice saved successfully!');
          if (editing) {
            onEdit(); // Exit editing mode after save
          }
        } else {
          alert('Invoice saved, but no document ID returned.');
        }
      } else {
        alert('Failed to save invoice.');
      }
    } catch (err) {
      alert('Error saving invoice: ' + err);
    }
  };

  // Show summary before saving
  const handleShowSummary = () => {
    setShowSummary(true);
    setPendingSave(true);
  };

  // Confirm save from summary
  const handleConfirmSave = async () => {
    setShowSummary(false);
    setPendingSave(false);
    await handleSaveToDB();
  };

  // Cancel save from summary
  const handleCancelSave = () => {
    setShowSummary(false);
    setPendingSave(false);
  };
  const expenseTypes = [
    "food", "transport", "utilities", "entertainment", "shopping", "healthcare", "other"
  ];
  return (
    <aside className={`flex flex-col bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ml-auto w-96 pointer-events-auto`}>
      <div className="flex justify-between items-center p-4 border-b border-[#3341551a] bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10">
        <h2 className="text-xl font-bold text-[#0F172A] drop-shadow">Invoice</h2>
        <button onClick={onClose} className="text-[#2F86A6] hover:text-[#34BE82] font-bold text-lg">&times;</button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        {/* Expense Type Display or Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-[#34BE82]">Expense Type</label>
          {expenseTypeDropdown ? (
            <select
              value={data.ExpenseType || "other"}
              onChange={e => onDataChange("ExpenseType", e.target.value)}
              className="mt-1 block w-full border-[#34BE82]/30 rounded-md shadow-sm focus:ring-[#34BE82] focus:border-[#34BE82] bg-[#34BE82]/10 text-[#0F172A] font-bold"
            >
              {expenseTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          ) : (
            <p className="mt-1 text-base text-[#0F172A] font-bold">{expenseType || data.ExpenseType || "Unknown"}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {invoiceFields.map(field => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-bold text-[#2F86A6]">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              {editing && !["invoice_date", "item_unit_price", "item_total_price", "item_description", "due_date", "customer_address"].includes(field) ? (
                <input type="text" value={data[field] || ""} onChange={e => onDataChange(field, e.target.value)} className="mt-1 block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold" />
              ) : field === "customer_address" ? (
                <div className="mt-1">
                  {/* Split address into lines for readability */}
                  {(data[field] || "")
                    .split(/,\s*/)
                    .map((part, idx) => (
                      <div key={idx} className="text-[#0F172A] font-semibold">{part}</div>
                    ))}
                </div>
              ) : field === "due_date" ? (
                <p className="mt-1 text-sm text-[#0F172A] font-semibold">
                  {/* Format due_date to 'DD MM YY-HH*MM' if possible, else show as is */}
                  {(() => {
                    const raw = data[field] || "";
                    const parsed = Date.parse(raw);
                    if (!isNaN(parsed)) {
                      const d = new Date(parsed);
                      const pad = n => n.toString().padStart(2, '0');
                      const day = pad(d.getDate());
                      const month = pad(d.getMonth() + 1);
                      const year = d.getFullYear().toString().slice(-2);
                      const hour = pad(d.getHours());
                      const min = pad(d.getMinutes());
                      return `${day} ${month} ${year}-${hour}*${min}`;
                    }
                    return raw;
                  })()}
                </p>
              ) : field === "invoice_date" ? (
                <p className="mt-1 text-sm text-[#0F172A] font-semibold">
                  {/* Format invoice_date to ISO string, set time to 00:00 if not present */}
                  {(() => {
                    const raw = data[field] || "";
                    if (!raw) return "";
                    // Try to parse date, add time if missing
                    let dateStr = raw.trim();
                    // If dateStr has no time, add 00:00
                    if (!/\d{1,2}:\d{2}/.test(dateStr)) {
                      dateStr += " 00:00";
                    }
                    // Try to parse as MM/DD/YYYY HH:mm or DD/MM/YYYY HH:mm
                    const parsed = Date.parse(dateStr);
                    if (!isNaN(parsed)) {
                      return new Date(parsed).toISOString();
                    }
                    return raw;
                  })()}
                </p>
              ) : field === "item_total_price" || field === "item_unit_price" ? (
                <div className="mt-1">
                  {/* Display as list, split by space or comma */}
                  {(data[field] || "")
                    .split(/[ ,]+/)
                    .filter(Boolean)
                    .map((part, idx) => (
                      <div key={idx} className="text-[#0F172A] font-semibold">{part}</div>
                    ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-[#0F172A] font-semibold">{data[field] || ""}</p>
              )}
            </div>
          ))}
          {/* Fallback: show any extra fields not in invoiceFields or model_label_ */}
          {Object.entries(data)
            .filter(([field]) => !invoiceFields.includes(field) && !field.startsWith("model_label_"))
            .map(([field, value]) => (
              <div key={field} className="mb-4">
                <label className="block text-sm font-bold text-[#2F86A6]">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (Extra)</label>
                {editing ? (
                  <input type="text" value={value || ""} onChange={e => onDataChange(field, e.target.value)} className="mt-1 block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold" />
                ) : (
                  <p className="mt-1 text-sm text-[#0F172A] font-semibold">{value || ""}</p>
                )}
              </div>
            ))}
        </div>
        <div className="flex justify-between mt-6">
          {!lastSavedId && (
            <div className="flex gap-2">
              <button onClick={onEdit} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-4 rounded-2xl font-bold hover:scale-105 transition-all">{editing ? 'Cancel' : 'Edit'}</button>
              <button onClick={handleShowSummary} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-4 rounded-2xl font-bold hover:scale-105 transition-all">Save Invoice</button>
      {/* Summary Modal */}
      {showSummary && (
        
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{
          backgroundImage: 'url(/receipt/receipt.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#295e99ff', // fallback color
        }}>
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-[#2F86A6]">Confirm Invoice Save</h3>
            <div className="mb-4 flex-1 overflow-y-auto">
              <div className="font-bold text-[#34BE82] mb-2">Summary:</div>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(data)
                  .filter(([key]) => !key.startsWith("model_label_") && key !== "DocumentType" && key !== "ExpenseType")
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-semibold text-[#2F86A6]">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-[#0F172A]">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={handleCancelSave} className="px-4 py-2 rounded-2xl bg-gray-200 text-[#2F86A6] font-bold">Cancel</button>
              <button onClick={handleConfirmSave} className="px-4 py-2 rounded-2xl bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white font-bold">Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
            </div>
          )}
        </div>
        {lastSavedId && (
          <div className="mt-2 text-green-700 font-bold">Saved Succefully!</div>
        )}
      </div>
    </aside>
  );
}
