
import React, { useEffect, useState } from "react";
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
  // Format displayed data for saving
  const getFormattedData = () => {
    // Format address (remove phone numbers, split into lines)
    const address = (data.Address || "")
      .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "")
      .split(/(?<=[a-zA-Z])\s(?=\d{5}|[A-Z][a-z]+|Wa|WA|Ave|St|Rd|Blvd|Dr|\d{1,5})/)
      .map(part => part.trim())
      .filter(Boolean)
      .join(", ");

    // Format prices
    const formatPrice = val => {
      val = (val || "").trim().replace(/^8(?=\d)/, '$');
      val = val.replace(/[^\d\$\.,]/g, "");
      return val;
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
      date: data.Date || '',
      items,
      order_id: data.OrderId || '',
      seller_address: address,
      seller_name: data.Title || '',
      subtotal: formatPrice(data.Subtotal),
      tax: formatPrice(data.Tax),
      total_price: formatPrice(data.TotalPrice),
      uploaded_date: new Date().toISOString(),
      user_ref: userRef || data.user_ref || '',
    };
  };

  // Show summary before saving
  const [showSummary, setShowSummary] = useState(false);
  const [lastSavedId, setLastSavedId] = useState("");
  const handleSaveToDB = async () => {
    const formatted = getFormattedData();
    // Convert subtotal, tax, total_price to float for backend
    formatted.subtotal = parseFloat(formatted.subtotal) || 0;
    formatted.tax = parseFloat(formatted.tax) || 0;
    formatted.total_price = parseFloat(formatted.total_price) || 0;
    console.log("Saving formatted data:", formatted);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/receipt', {
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
          alert('Receipt saved! Document ID: ' + result.doc_id);
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
    "food", "transport", "utilities", "entertainment", "shopping", "healthcare", "other"
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
              <label className="block text-sm font-bold text-[#2F86A6]">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              {editing ? (
                <input type="text" value={data[field] || ""} onChange={e => onDataChange(field, e.target.value)} className="mt-1 block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold" />
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
                  {(() => {
                    let val = data[field] || "";
                    // Replace leading '8' with '$'
                    val = val.trim().replace(/^8(?=\d)/, '$');
                    // Remove all letters except $ and keep only numbers, dots, commas
                    val = val.replace(/[^\d\$\.\,]/g, "");
                    return val;
                  })()}
                </p>
              ) : (
                <p className="mt-1 text-sm text-[#0F172A] font-semibold">{data[field] || ""}</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-6">
          {/* Save button for extracted data before editing */}
          {!editing && (
            <>
              <button onClick={() => setShowSummary(true)} className="bg-green-600 text-white py-2 px-4 rounded-2xl font-bold hover:bg-green-700">Save Receipt</button>
              {showSummary && (
                <div
                  className="fixed inset-0 flex items-center justify-center z-50"
                  style={{
                    backgroundImage: 'url(/receipt/receipt.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#295e99ff', // fallback color
                  }}
                >
                  {/* Overlay for readability */}
                  <div className="absolute inset-0 bg-white bg-opacity-70" style={{zIndex: 1}}></div>
                  <div className="relative bg-white rounded-2xl shadow-xl p-6 w-96 max-h-[80vh] flex flex-col" style={{zIndex: 2}}>
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
                      <div className="text-[#1e293b]">{getFormattedData().subtotal}</div>
                      <div className="font-bold text-[#0F172A] mt-2 mb-1">Tax:</div>
                      <div className="text-[#1e293b]">{getFormattedData().tax}</div>
                      <div className="font-bold text-[#0F172A] mt-2 mb-1">Total Price:</div>
                      <div className="text-[#1e293b]">{getFormattedData().total_price}</div>
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <button onClick={handleSaveToDB} className="bg-green-600 text-white py-2 px-4 rounded-2xl font-bold hover:bg-green-700">Confirm & Save</button>
                      <button onClick={() => setShowSummary(false)} className="bg-gray-300 text-[#0F172A] py-2 px-4 rounded-2xl font-bold hover:bg-gray-400">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between">
            <button onClick={onEdit} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-4 rounded-2xl font-bold hover:scale-105 transition-all">{editing ? 'Cancel' : 'Edit'}</button>
            {editing && (
              <button onClick={async () => { onSave(); await handleSaveToDB(); }} className="bg-green-600 text-white py-2 px-4 rounded-2xl font-bold hover:bg-green-700">Save Changes</button>
            )}
          </div>
          {lastSavedId && (
            <div className="mt-2 text-green-700 font-bold">Saved! Document ID: {lastSavedId}</div>
          )}
        </div>
      </div>
    </aside>
  );
}
