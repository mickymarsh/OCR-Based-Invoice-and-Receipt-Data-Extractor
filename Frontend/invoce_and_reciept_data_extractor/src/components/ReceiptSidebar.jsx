
import React from "react";

const receiptFields = [
  "Address", "Date", "Item", "OrderId", "Subtotal", "Tax", "Title", "TotalPrice"
];

export default function ReceiptSidebar({ data, editing, onEdit, onSave, onDataChange, onClose }) {
  return (
    <aside className={`flex flex-col bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ml-auto w-96 pointer-events-auto`}>
      <div className="flex justify-between items-center p-4 border-b border-[#3341551a] bg-gradient-to-br from-[#2F86A6]/10 to-[#34BE82]/10">
        <h2 className="text-xl font-bold text-[#0F172A] drop-shadow">Receipt</h2>
        <button onClick={onClose} className="text-[#2F86A6] hover:text-[#34BE82] font-bold text-lg">&times;</button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 gap-4">
          {receiptFields.map(field => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-bold text-[#2F86A6]">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              {editing ? (
                <input type="text" value={data[field] || ""} onChange={e => onDataChange(field, e.target.value)} className="mt-1 block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold" />
              ) : (
                <p className="mt-1 text-sm text-[#0F172A] font-semibold">{data[field] || ""}</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={onEdit} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-4 rounded-2xl font-bold hover:scale-105 transition-all">{editing ? 'Cancel' : 'Edit'}</button>
          {editing && (
            <button onClick={onSave} className="bg-green-600 text-white py-2 px-4 rounded-2xl font-bold hover:bg-green-700">Save Changes</button>
          )}
        </div>
      </div>
    </aside>
  );
}
