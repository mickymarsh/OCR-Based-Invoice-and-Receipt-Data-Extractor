
import React, { useEffect, useState, useRef } from "react";
import { API_BASE } from "@/lib/config";
import { auth } from "../lib/firebase";

const receiptFields = [
  "Address", "Date", "Item", "OrderId", "Subtotal", "Tax", "Title", "TotalPrice"
];

export default function ReceiptSidebar({ data, editing, onEdit, onSave, onDataChange, onClose, expenseType, expenseTypeDropdown }) {
  // Get logged-in user's UID for user_ref
  const [userRef, setUserRef] = useState("");
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserRef(`/Users/${user.uid}`);
    }
  }, []);
  
  // Parse numeric price strings to a float, supporting both US (1,234.56) and European (1.234,56) styles
  const parseNumericPrice = (val) => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    let s = String(val).trim();
    if (!s) return 0;
    // Remove currency symbol placeholder '8' if present at start
    s = s.replace(/^8(?=\d)/, '');
    // Remove spaces
    s = s.replace(/\s+/g, '');
    // If string contains both dot and comma, assume:
    // - If comma occurs after dot (like 1.234,56) -> European: remove dots, replace comma with dot
    // - If dot occurs after comma (rare) -> treat accordingly
    const hasDot = s.indexOf('.') !== -1;
    const hasComma = s.indexOf(',') !== -1;
    if (hasDot && hasComma) {
      const lastDot = s.lastIndexOf('.');
      const lastComma = s.lastIndexOf(',');
      if (lastComma > lastDot) {
        // European: remove dots (thousand sep), replace comma with dot
        s = s.replace(/\./g, '').replace(/,/g, '.');
      } else {
        // US-ish: remove commas
        s = s.replace(/,/g, '');
      }
    } else if (hasComma && !hasDot) {
      // If only commas present, treat comma as decimal separator if there is only one comma
      const commaCount = (s.match(/,/g) || []).length;
      if (commaCount === 1) {
        s = s.replace(/,/g, '.');
      } else {
        // multiple commas -> remove them (thousand separators)
        s = s.replace(/,/g, '');
      }
    } else {
      // only dot or only digits -> remove commas just in case
      s = s.replace(/,/g, '');
    }
    // Remove any remaining non-digit, non-dot, non-minus
    s = s.replace(/[^\d\.\-]/g, '');
    // If multiple dots, collapse extras (keep first as decimal)
    const parts = s.split('.');
    if (parts.length > 2) {
      s = parts.shift() + '.' + parts.join('');
    }
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  // Format a raw value to display as numeric string with 2 decimals (en-US style)
  const formatNumber = (raw) => {
    if (raw === undefined || raw === null || String(raw).trim() === '') return "";
    const n = parseNumericPrice(raw);
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Safely render field values (convert Date -> ISO, objects -> JSON, else string)
  const renderFieldValue = (val) => {
    if (val === undefined || val === null) return '';
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'object') {
      try { return JSON.stringify(val); } catch (e) { return String(val); }
    }
    return String(val);
  };
  // Helpers to convert between ISO and input[type=datetime-local] values
  const isoToLocal = (iso) => {
    if (!iso) return '';
    const parsed = Date.parse(iso);
    if (isNaN(parsed)) return '';
    const d = new Date(parsed);
    const pad = n => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };
  const localToIso = (local) => {
    if (!local) return '';
    const parsed = Date.parse(local);
    if (isNaN(parsed)) return '';
    return new Date(parsed).toISOString();
  };
  // Display helper: attempt to return ISO string for display/use in datetime-local
  const displayISO = (raw) => {
    if (!raw) return '';
    if (raw instanceof Date) return raw.toISOString();
    const parsed = Date.parse(String(raw));
    if (!isNaN(parsed)) return new Date(parsed).toISOString();
    return '';
  };
  // Format displayed data for saving
  const getFormattedData = () => {
  // Helper: parse common date formats to ISO string (UTC). If parsing fails, return raw string.
  const parseDateISO = (raw) => {
      // If it's already a Date object, return its ISO string
      if (raw instanceof Date) return raw.toISOString();
      // If falsy, return current time ISO
      if (!raw) return new Date().toISOString();
      let s = String(raw).trim();
      // Try native Date.parse first
      const parsed = Date.parse(s);
      if (!isNaN(parsed)) return new Date(parsed).toISOString();

      // Try common formats: DD/MM/YYYY, D/M/YYYY, DD-MM-YYYY, MM/DD/YYYY with optional time
      const dm = s.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2,4})(?:\s+(\d{1,2}:\d{2})(?::\d{2})?)?$/);
      if (dm) {
        let day = dm[1];
        let month = dm[2];
        let year = dm[3];
        const timePart = dm[4] || '00:00';
        if (year.length === 2) year = '20' + year;
        let d = parseInt(day, 10);
        let m = parseInt(month, 10);
        // If month value > 12 and day <=12, swap (handles ambiguous MM/DD vs DD/MM)
        if (m > 12 && d <= 12) {
          [d, m] = [m, d];
        }
        // Build ISO-ish string in UTC
        const isoStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${timePart}:00Z`;
        const iso = Date.parse(isoStr);
        if (!isNaN(iso)) return new Date(iso).toISOString();
      }

      // Final fallback: return current time in ISO format to ensure DB receives standard datetime
      return new Date().toISOString();
    };
    // Format address (remove phone numbers, split into lines)
    const address = (data.Address || "")
      .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "")
      .split(/(?<=[a-zA-Z])\s(?=\d{5}|[A-Z][a-z]+|Wa|WA|Ave|St|Rd|Blvd|Dr|\d{1,5})/)
      .map(part => part.trim())
      .filter(Boolean)
      .join(", ");

    // Format prices: return cleaned numeric string (keep dots and commas for parsing)
    const formatPrice = val => {
      let s = (val || "").trim();
      if (!s) return "";
      // Replace leading '8' that stands in for '$'
      s = s.replace(/^8(?=\d)/, '$');
      // Remove letters and currency symbols except digits, dot, comma, minus
      s = s.replace(/[^\d\.,\-]/g, "");
      return s;
    };


    // Format items
    const items = (data.Item || "").split(/(?<=\d{2,})\s+/).map(line => {
      const regex = /^(.*?)(?:\s+(\d+))?\s+([8$]?\d+[\d\.,]*)$/;
      const match = line.trim().match(regex);
      if (match) {
        let name = match[1].trim();
        let quantity = match[2] ? match[2] : "1";
        let price = match[3].trim();
        if (price.startsWith('8')) price = '$' + price.slice(1);
        if (!price.startsWith('$')) price = '$' + price;
        return { name, quantity, price };
      }
      return null;
    }).filter(Boolean);

    return {
      category: data.ExpenseType || '',
      // Ensure date is an ISO datetime string
      date: parseDateISO(data.Date || new Date()),
      items,
      order_id: data.OrderId || '',
      seller_address: address,
      seller_name: data.Title || '',
  subtotal: formatPrice(data.Subtotal),
  tax: formatPrice(data.Tax),
  total_price: formatPrice(data.TotalPrice),
  uploaded_date: new Date().toISOString(),
      user_id: userRef || data.user_id || '',
    };
  };

  // Show summary before saving
  const [showSummary, setShowSummary] = useState(false);
  const [lastSavedId, setLastSavedId] = useState("");
  const [totalError, setTotalError] = useState("");
  const [dateError, setDateError] = useState("");
  const totalInputRef = useRef(null);

  // Check whether a total amount is present and looks numeric
  const isTotalPresent = () => {
    const raw = data.TotalPrice;
    if (raw === undefined || raw === null) return false;
    const s = String(raw).trim();
    if (s === "") return false;
    // Strip non-numeric characters except dot and minus
    const num = parseFloat(s.replace(/[^\d\.\-]/g, ""));
    return !isNaN(num);
  };

  // Attempt to show the confirm summary; if total is missing, switch to edit mode and focus total input
  const attemptShowSummary = () => {
    // Validate date presence
    const dateRaw = data.Date;
    if (!dateRaw || String(dateRaw).trim() === '') {
      setDateError('Date is required. Please add date and time.');
      if (!editing && typeof onEdit === 'function') onEdit();
      return;
    }
    setDateError('');
    if (!isTotalPresent()) {
      setTotalError('Total amount is missing or invalid. Please enter the total amount.');
      if (!editing && typeof onEdit === 'function') {
        onEdit();
      }
      // Focus the total input once editing UI is visible
      setTimeout(() => {
        try { totalInputRef.current && totalInputRef.current.focus && totalInputRef.current.focus(); } catch (e) {}
      }, 50);
      return;
    }
    setTotalError("");
    setShowSummary(true);
  };
  const handleSaveToDB = async () => {
    const formatted = getFormattedData();
    // Convert subtotal, tax, total_price to float for backend (handle comma-as-decimal and symbols)
    const toFloat = (v) => {
      // Use parseNumericPrice which handles commas and dots
      return parseNumericPrice(v);
    };
    formatted.subtotal = toFloat(formatted.subtotal);
    formatted.tax = toFloat(formatted.tax);
    formatted.total_price = toFloat(formatted.total_price);
    console.log("Saving formatted data:", formatted);
    try {
  const response = await fetch(`${API_BASE}/api/receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formatted),
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.doc_id) {
          setLastSavedId(result.doc_id);
          alert('Receipt saved successfully!');
        } else {
          alert('Receipt saved, but no document ID returned.');
        }
      } else {
        alert('Failed to save receipt.');
      }
    } catch (err) {
      alert('Error saving receipt: ' + err);
    }
    setShowSummary(false);
  };
  const expenseTypes = [
    "Food", "Transport", "Utilities", "Entertainment", "Shopping", "Healthcare", "other"
  ];
  return (
    <aside className={`flex flex-col bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ml-auto w-96 pointer-events-auto`}>
      <div className="flex justify-between items-center p-4 border-b border-[#3341551a] bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10">
        <h2 className="text-xl font-bold text-[#0F172A] drop-shadow">Receipt</h2>
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
        {/* Item grid display for receipts */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-[#2F86A6] mb-2">Items</label>
          <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] rounded-lg p-2 border border-[#2F86A6]/10">
            <div className="font-bold text-[#2F86A6]">Item Name</div>
            <div className="font-bold text-[#2F86A6] text-center">Quantity</div>
            <div className="font-bold text-[#2F86A6] text-right">Price</div>
            {/* Parse items from Item field */}
            {(data.Item || "").split(/(?<=\d{2,})\s+/).map((line, idx) => {
              // Try to extract item name, quantity, price
              // e.g. "Mega Poke Bow 1 817.00" or "Hamachi Sashimi $12.00"
              const regex = /^(.*?)(?:\s+(\d+))?\s+([8$]?\d+[\d\.\,]*)$/;
              const match = line.trim().match(regex);
              if (match) {
                let name = match[1].trim();
                let quantity = match[2] ? match[2] : "1";
                let price = match[3].trim();
                // Replace leading '8' with '$'
                if (price.startsWith('8')) price = '$' + price.slice(1);
                if (!price.startsWith('$')) price = '$' + price;
                return (
                  <React.Fragment key={idx}>
                    <div className="text-[#0F172A]">{name}</div>
                    <div className="text-center text-[#0F172A]">{quantity}</div>
                    <div className="text-right text-[#34BE82] font-bold">{price}</div>
                  </React.Fragment>
                );
              }
              return null;
            })}
          </div>
        </div>
        {/* Other receipt fields */}
        <div className="grid grid-cols-1 gap-4">
          {receiptFields.filter(f => f !== "Item").map(field => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-bold text-[#2F86A6]">
                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {editing && field === 'TotalPrice' && (
                  <span className="text-red-600 ml-1" aria-hidden="true">*</span>
                )}
              </label>
              {editing ? (
                // Make Date a datetime-local input and TotalPrice required in edit mode
                field === 'Date' ? (
                  <div>
                    <input
                      type="datetime-local"
                      value={isoToLocal(displayISO(data[field]))}
                      onChange={e => { onDataChange(field, localToIso(e.target.value)); if (dateError) setDateError(''); }}
                      required
                      aria-required="true"
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold ${dateError ? 'border-red-500 ring-red-200' : 'border-[#2F86A6]/30'}`}
                    />
                    {dateError && (
                      <div className="text-red-600 text-sm mt-1">{dateError}</div>
                    )}
                  </div>
                ) : field === 'TotalPrice' ? (
                  <div>
                    <input
                      ref={totalInputRef}
                      type="text"
                      value={data[field] || ""}
                      onChange={e => { onDataChange(field, e.target.value); if (totalError) setTotalError(''); }}
                      required
                      aria-required="true"
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold ${totalError ? 'border-red-500 ring-red-200' : 'border-[#2F86A6]/30'}`}
                    />
                    {totalError && (
                      <div className="text-red-600 text-sm mt-1">{totalError}</div>
                    )}
                  </div>
                ) : (
                  <input type="text" value={data[field] || ""} onChange={e => onDataChange(field, e.target.value)} className="mt-1 block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold" />
                )
              ) : field === "Address" ? (
                <div className="mt-1">
                  {/* Remove phone numbers and split address into rows */}
                  {((data[field] || "")
                    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "") // Remove phone numbers
                    .split(/(?<=[a-zA-Z])\s(?=\d{5}|[A-Z][a-z]+|Wa|WA|Ave|St|Rd|Blvd|Dr|\d{1,5})/)
                    .map((part, idx) => part.trim())
                    .filter(Boolean)
                    .map((part, idx) => (
                      <div key={idx} className="text-[#0F172A] font-semibold">{part}</div>
                    )))}
                </div>
              ) : (["TotalPrice", "Subtotal", "Tax"].includes(field)) ? (
                <p className="mt-1 text-sm text-[#0F172A] font-semibold">
                  {formatNumber(data[field])}
                </p>
              ) : (
                <p className="mt-1 text-sm text-[#0F172A] font-semibold">{renderFieldValue(data[field])}</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-6">
          {/* Save button for extracted data before editing */}
          {!editing && !lastSavedId && (
            <>
              <div className="flex gap-2 justify-between">
                <button onClick={onEdit} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-4 rounded-2xl font-bold hover:scale-105 transition-all">Edit</button>
                <button onClick={attemptShowSummary} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-4 rounded-2xl font-bold hover:scale-105 transition-all">Save Receipt</button>
              </div>
            </>
          )}
          <div className="flex gap-2 justify-between">
            {editing && (
              <div className="flex gap-2 justify-between">
                <button onClick={onEdit} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-4 rounded-2xl font-bold hover:scale-105 transition-all">Cancel</button>
                <button onClick={attemptShowSummary} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-4 rounded-2xl font-bold hover:scale-105 transition-all">Save Changes</button>
              </div>
            )}
          </div>
          {lastSavedId && (
            <div className="mt-2 text-green-700 font-bold">Receipt Saved! </div>
          )}
          {showSummary && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-white bg-opacity-70"
                style={{
                  backgroundImage: 'url(/receipt/receipt.jpeg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#295e99ff', // fallback color
                }}></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-6 w-96 max-h-[80vh] flex flex-col" style={{ zIndex: 2 }}>
                <h3 className="text-lg font-bold mb-2 text-[#0F172A]">Confirm Save</h3>
                <div className="mb-4 overflow-y-auto text-[#1e293b]" style={{ maxHeight: '55vh' }}>
                  <div className="font-bold text-[#0F172A] mb-1">Expense Type:</div>
                  <div className="text-[#1e293b]">{getFormattedData().category}</div>
                  <div className="font-bold text-[#0F172A] mt-2 mb-1">Date:</div>
                  <div className="text-[#1e293b]">{getFormattedData().date}</div>
                  <div className="font-bold text-[#0F172A] mt-2 mb-1">Order ID:</div>
                  <div className="text-[#1e293b]">{getFormattedData().order_id}</div>
                  <div className="font-bold text-[#0F172A] mt-2 mb-1">Seller Name:</div>
                  <div className="text-[#1e293b]">{getFormattedData().seller_name}</div>
                  <div className="font-bold text-[#0F172A] mt-2 mb-1">Seller Address:</div>
                  <div className="text-[#1e293b]">{getFormattedData().seller_address}</div>
                  <div className="font-bold text-[#0F172A] mt-2 mb-1">Items:</div>
                  <ul className="list-disc ml-4 text-[#1e293b]">
                    {getFormattedData().items.map((item, idx) => (
                      <li key={idx}>{item.name} (Qty: {item.quantity}, Price: {item.price})</li>
                    ))}
                  </ul>
                  <div className="font-bold text-[#0F172A] mt-2 mb-1">Subtotal:</div>
                  <div className="text-[#1e293b]">{formatNumber(getFormattedData().subtotal)}</div>
                  <div className="font-bold text-[#0F172A] mt-2 mb-1">Tax:</div>
                  <div className="text-[#1e293b]">{formatNumber(getFormattedData().tax)}</div>
                  <div className="font-bold text-[#0F172A] mt-2 mb-1">Total Price:</div>
                  <div className="text-[#1e293b]">{formatNumber(getFormattedData().total_price)}</div>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={async () => { 
                    if (editing) { 
                      onSave(); 
                      if (typeof onEdit === 'function') onEdit(); // Switch to viewing mode
                    }
                    await handleSaveToDB(); 
                  }} className="bg-green-600 text-white py-2 px-4 rounded-2xl font-bold hover:bg-green-700">Confirm & Save</button>
                  <button onClick={() => setShowSummary(false)} className="bg-gray-300 text-[#0F172A] py-2 px-4 rounded-2xl font-bold hover:bg-gray-400">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
