import React from "react";

const invoiceFields = [
  "customer_address", "customer_name", "due_date", "invoice_date", "invoice_number", "invoice_subtotal", "invoice_total",
  "item_description", "item_quantity", "item_total_price", "item_unit_price", "supplier_address", "supplier_name", "tax_amount", "tax_rate"
];

export default function InvoiceSidebar({ data, editing, onEdit, onSave, onDataChange, onClose }) {
  return (
    <aside className={`flex flex-col bg-blue-50 rounded-lg shadow-xl transition-all duration-300 overflow-hidden ml-auto w-96 pointer-events-auto`}>
      <div className="flex justify-between items-center p-4 border-b border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900">Invoice</h2>
        <button onClick={onClose} className="text-blue-600 hover:text-blue-800 font-bold text-lg">&times;</button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 gap-4">
          {invoiceFields.map(field => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-medium text-blue-700">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              {editing ? (
                <input type="text" value={data[field] || ""} onChange={e => onDataChange(field, e.target.value)} className="mt-1 block w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-100 text-blue-900 font-bold" />
              ) : (
                <p className="mt-1 text-sm text-blue-900">{data[field] || ""}</p>
              )}
            </div>
          ))}
          {/* Fallback: show any extra fields not in invoiceFields or model_label_ */}
          {Object.entries(data)
            .filter(([field]) => !invoiceFields.includes(field) && !field.startsWith("model_label_"))
            .map(([field, value]) => (
              <div key={field} className="mb-4">
                <label className="block text-sm font-medium text-blue-700">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (Extra)</label>
                {editing ? (
                  <input type="text" value={value || ""} onChange={e => onDataChange(field, e.target.value)} className="mt-1 block w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-100 text-blue-900 font-bold" />
                ) : (
                  <p className="mt-1 text-sm text-blue-900">{value || ""}</p>
                )}
              </div>
            ))}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={onEdit} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">{editing ? 'Cancel' : 'Edit'}</button>
          {editing && (
            <button onClick={onSave} className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">Save Changes</button>
          )}
        </div>
      </div>
    </aside>
  );
}
