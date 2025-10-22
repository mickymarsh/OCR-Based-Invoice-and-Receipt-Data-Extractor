
import React, { useState } from "react";
import { getAuth } from "firebase/auth";

const invoiceFields = [
  "customer_address", "customer_name", "due_date", "invoice_date", "invoice_number", "invoice_subtotal", "invoice_total",
  "item_description", "item_quantity", "item_total_price", "item_unit_price", "supplier_address", "supplier_name", "tax_amount", "tax_rate"
];

export default function InvoiceSidebar({ data, editing, onEdit, onSave, onDataChange, onClose, expenseType, expenseTypeDropdown }) {
  // Helper: get the effective due date (due_date, or fallback to date, then invoice_date)
  const getEffectiveDueDate = () => {
    if (data.due_date && parseDateISO(data.due_date)) return data.due_date;
    if (data.date && parseDateISO(data.date)) return data.date;
    if (data.invoice_date && parseDateISO(data.invoice_date)) return data.invoice_date;
    return data.due_date || data.date || data.invoice_date || '';
  };
  // Save invoice data to backend
  const [showSummary, setShowSummary] = useState(false);
  const [lastSavedId, setLastSavedId] = useState("");
  const [requiredErrors, setRequiredErrors] = useState({});
  const [pendingSave, setPendingSave] = useState(false);
  const [saving, setSaving] = useState(false);

  // Helper: parse common date formats to ISO string (UTC). If parsing fails, return raw string.
  const parseDateISO = (raw) => {
    // Return an ISO 8601 string for any valid input, or empty string on failure.
    if (raw instanceof Date) return raw.toISOString();
    if (!raw) return '';
    let s = String(raw).trim();
    // Normalize common noise characters and non-breaking spaces
    s = s.replace(/\u00A0/g, ' ').trim();
    // Quick normalization: convert '*' to ':' (time separator) for easier parsing
    const norm = s.replace(/\*/g, ':');

    // Quick native parse first for standard formats
    const parsed = Date.parse(norm);
    if (!isNaN(parsed)) return new Date(parsed).toISOString();

    // Explicit short form: 'DD-MM*HH' or 'DD/MM:HH' -> interpret as day-month-hour (current year)
    const shortTime = norm.match(/^(\d{1,2})[\s\-._\/](\d{1,2})[:](\d{1,2})$/);
    if (shortTime) {
      const day = shortTime[1].padStart(2, '0');
      const month = shortTime[2].padStart(2, '0');
      const hour = shortTime[3].padStart(2, '0');
      const yearNow = new Date().getFullYear();
      const isoStr = `${yearNow}-${month}-${day}T${hour}:00:00Z`;
      const parsedIso = Date.parse(isoStr);
      if (!isNaN(parsedIso)) return new Date(parsedIso).toISOString();
    }

    // Handle custom display format produced in UI: 'DD MM YY-HH*MM' or 'DD MM YYYY-HH*MM'
    // Examples: '02 10 25-14*30' or '02 10 2025-14*30'
    const custom = s.match(/^(\d{1,2})[\s\-._/](\d{1,2})[\s\-._/](\d{2,4})(?:[\s\-_:T]+(\d{1,2})\*?(\d{2}))?$/);
    if (custom) {
      let day = custom[1].padStart(2, '0');
      let month = custom[2].padStart(2, '0');
      let year = custom[3];
      if (year.length === 2) year = '20' + year;
      const hour = (custom[4] || '00').padStart(2, '0');
      const minute = (custom[5] || '00').padStart(2, '0');
      const isoStr = `${year}-${month}-${day}T${hour}:${minute}:00Z`;
      const iso = Date.parse(isoStr);
      if (!isNaN(iso)) return new Date(iso).toISOString();
    }

    // Try common separators like 'DD/MM/YYYY HH:MM' or 'MM-DD-YYYY HH:MM'
    const alt = s.replace(/(\*)/g, ':').replace(/\s*-\s*/g, ' ').replace(/\*/g, ':');
    const parsedAlt = Date.parse(alt);
    if (!isNaN(parsedAlt)) return new Date(parsedAlt).toISOString();

    // Last resort: attempt to extract groups of numbers and guess order
    const nums = s.match(/\d{1,4}/g);
    if (nums && nums.length >= 3) {
      // If pattern looks like DD MM HH (e.g. '31-05*16'), interpret as day/month/hour in the current year
      const n0 = parseInt(nums[0], 10);
      const n1 = parseInt(nums[1], 10);
      const n2 = parseInt(nums[2], 10);
      if (nums.length === 3 && n2 <= 23) {
        const yearNow = new Date().getFullYear();
        const day = String(n0).padStart(2, '0');
        const month = String(n1).padStart(2, '0');
        const hour = String(n2).padStart(2, '0');
        const isoGuess = `${yearNow}-${month}-${day}T${hour}:00:00Z`;
        const isoG = Date.parse(isoGuess);
        if (!isNaN(isoG)) return new Date(isoG).toISOString();
      }

      // Otherwise, try to locate a year-like token (4 digits or >31)
      let yIdx = nums.findIndex(n => n.length === 4 || parseInt(n, 10) > 31);
      let year = yIdx >= 0 ? nums[yIdx] : nums[2];
      let d = nums[0];
      let m = nums[1];
      if (yIdx === 0) { // year first
        year = nums[0]; d = nums[2]; m = nums[1];
      }
      if (year.length === 2) year = '20' + year;
      const isoGuess2 = `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T00:00:00Z`;
      const isoG2 = Date.parse(isoGuess2);
      if (!isNaN(isoG2)) return new Date(isoG2).toISOString();
    }

    return '';
  };

  // Display helper: return a standardized ISO string or a readable fallback
  const displayISO = (raw) => {
    if (!raw) return '';
    const iso = parseDateISO(raw);
    if (iso) return iso; // already ISO string
    // If parse failed but raw parses natively, return that ISO
    const parsed = Date.parse(String(raw));
    if (!isNaN(parsed)) return new Date(parsed).toISOString();
    // Last resort: return original value
    return String(raw);
  };

  // Helpers to convert between ISO and input[type=datetime-local] values
  const isoToLocal = (iso) => {
    if (!iso) return '';
    const parsed = Date.parse(iso);
    if (isNaN(parsed)) return '';
    const d = new Date(parsed);
    // build yyyy-MM-ddTHH:mm for datetime-local
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
    // local is like 'YYYY-MM-DDTHH:MM'
    const parsed = Date.parse(local);
    if (isNaN(parsed)) return '';
    return new Date(parsed).toISOString();
  };
  // Parse invoice total strings into a numeric value.
  // Handles examples like "$ 124,79", "1.234,56", "1,234.56", "USD124.50" and removes noisy characters.
  const parseInvoiceNumber = (raw) => {
    if (raw === null || raw === undefined) return NaN;
    let s = String(raw).trim();
    if (s === '') return NaN;
    // keep only digits, comma, dot and minus (remove currency letters/symbols and whitespace)
    s = s.replace(/[^0-9.,-]/g, '');
    // remove any minus signs not at the start
    s = s.replace(/(?!^)-/g, '');

    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');

    if (lastDot !== -1 && lastComma !== -1) {
      // Both present: assume the last-occurring separator is the decimal separator
      const decimalSep = lastComma > lastDot ? ',' : '.';
      const thousandSep = decimalSep === ',' ? '.' : ',';
      const reThousand = new RegExp('\\' + thousandSep, 'g');
      s = s.replace(reThousand, '');
      if (decimalSep === ',') s = s.replace(/,/g, '.');
    } else if (lastComma !== -1) {
      // Only commas present
      const parts = s.split(',');
      const lastPartLen = parts[parts.length - 1].length;
      // If groups of three on the left side, treat commas as thousand separators
      const leftGroupsAreThrees = parts.length > 1 && parts.slice(0, -1).every(p => p.length === 3);
      if (leftGroupsAreThrees) {
        s = parts.join('');
      } else if (lastPartLen === 2 || lastPartLen === 1) {
        // likely decimal separator (e.g. 124,79)
        s = s.replace(/,/g, '.');
      } else {
        // ambiguous - remove commas
        s = parts.join('');
      }
    } else if (lastDot !== -1) {
      // Only dots present
      const parts = s.split('.');
      const leftGroupsAreThrees = parts.length > 1 && parts.slice(0, -1).every(p => p.length === 3);
      if (leftGroupsAreThrees) {
        s = parts.join('');
      }
      // otherwise dot is decimal and left as-is
    }

    // Remove any leftover unwanted characters
    s = s.replace(/[^0-9.\-]/g, '');
    // If multiple dots remain, keep the first as decimal separator
    const firstDot = s.indexOf('.');
    if (firstDot !== -1) {
      s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
    }

    if (s === '' || s === '-' || s === '.' || s === '-.') return NaN;
    const num = Number(s);
    return Number.isFinite(num) ? num : NaN;
  };
  // Save to DB after confirmation
  const handleSaveToDB = async () => {
    setSaving(true);
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
    // Always patch due_date to the effective value before mapping
    let patchedData = { ...data, due_date: getEffectiveDueDate() };
    const invoiceData = {};
    Object.entries(keyMap).forEach(([frontendKey, backendKey]) => {
      if (frontendKey === "sent_email") {
        invoiceData[backendKey] = false;
        return;
      }
      if (frontendKey === "uploaded_date") {
        invoiceData[backendKey] = new Date().toISOString();
        return;
      }
      if (frontendKey === "user_id") {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        invoiceData[backendKey] = (currentUser && currentUser.uid) ? `/Users/${currentUser.uid}` : "";
        return;
      }
      // invoice_total: ensure numeric
      if (frontendKey === "invoice_total") {
        const raw = patchedData[frontendKey] ?? '';
        const num = parseInvoiceNumber(raw);
        invoiceData[backendKey] = isNaN(num) ? 0 : num;
        return;
      }
      if (patchedData[frontendKey] !== undefined) {
        if (frontendKey === 'due_date') {
          // prefer parsed ISO from patchedData (in case input used datetime-local -> localToIso)
          let parsedIso = '';
          if (typeof patchedData[frontendKey] === 'string') {
            parsedIso = parseDateISO(patchedData[frontendKey]) || patchedData[frontendKey];
          }
          if (!parsedIso) {
            // fallback to 5 days
            const fiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
            parsedIso = fiveDays.toISOString();
          }
          invoiceData[backendKey] = parsedIso;
        } else {
          invoiceData[backendKey] = patchedData[frontendKey];
        }
      }
    });
    console.log('invoce data',invoiceData);
    try {
      console.log('sending invoice payload', invoiceData);
      const response = await fetch('http://127.0.0.1:8000/api/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });
      if (response.ok) {
        const result = await response.json().catch(() => null);
        // consider success if server returned OK; prefer doc_id when available
        if (result && result.doc_id) {
          setLastSavedId(result.doc_id);
        }
        alert('Invoice saved successfully!');
        if (editing) {
          onEdit(); // Exit editing mode after save
        }
        return true;
      } else {
        const txt = await response.text().catch(() => '');
        console.error('Save failed, status:', response.status, 'body:', txt);
        alert('Failed to save invoice. Server responded with ' + response.status + '\n' + txt);
        return false;
      }
    } catch (err) {
      console.error('Error during invoice save:', err);
      alert('Error saving invoice: ' + (err.message || err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Show summary before saving
  const validateRequired = () => {
  const errs = {};
  // due_date must parse to ISO (use effective value)
  const effDue = getEffectiveDueDate();
  const due = effDue ? parseDateISO(effDue) : '';
  if (!due) errs.due_date = 'Please provide a valid due date.';
  // invoice_total must be a numeric float
  const totalRaw = data && (data.invoice_total !== undefined) ? data.invoice_total : '';
  const totalNum = parseInvoiceNumber(totalRaw);
  if (totalRaw === '' || isNaN(totalNum)) errs.invoice_total = 'Please enter invoice total (number).';
  setRequiredErrors(errs);
  return Object.keys(errs).length === 0;
  };

  const handleShowSummary = () => {
    // validate required fields first
    const ok = validateRequired();
    if (!ok) {
      // Keep sidebar open and show inline errors
      setShowSummary(false);
      setPendingSave(false);
      // focus first missing field if possible
      const firstMissing = Object.keys(requiredErrors)[0] || Object.keys({}).length && Object.keys(requiredErrors)[0];
      // we can't reliably focus without refs; user will see inline messages
      return;
    }
    setRequiredErrors({});
    setShowSummary(true);
    setPendingSave(true);
  };

  // Confirm save from summary
  const handleConfirmSave = async () => {
    // Re-validate before sending (in case fields changed while modal open)
    const ok = validateRequired();
    if (!ok) {
      // keep modal open so user can fix errors
      setShowSummary(true);
      setPendingSave(false);
      return;
    }
    // Attempt save and only close the modal on success
    setPendingSave(false);
    const success = await handleSaveToDB();
    if (success) {
      setShowSummary(false);
      setPendingSave(false);
    } else {
      // Keep modal open for retry/fix
      setShowSummary(true);
      setPendingSave(false);
    }
  };

  // Cancel save from summary
  const handleCancelSave = () => {
    setShowSummary(false);
    setPendingSave(false);
  };
  const expenseTypes = [
    "Food", "Transport", "Utilities", "Entertainment", "Shopping", "Healthcare", "other"
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
              {editing ? (
                // In editing mode: make every field editable. Use specialized inputs where helpful.
                (field === 'due_date') ? (
                  <div className="mt-1">
                    <input
                      required
                      aria-required
                      type="datetime-local"
                      value={isoToLocal(displayISO(data[field]))}
                      onChange={e => onDataChange(field, localToIso(e.target.value))}
                      className="block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold p-2"
                    />
                    {!data[field] && (
                      <div className="text-red-600 text-sm mt-1">Due date is required</div>
                    )}
                  </div>
                ) : (field === 'invoice_date') ? (
                  <div className="mt-1">
                    <input
                      type="datetime-local"
                      value={isoToLocal(displayISO(data[field]))}
                      onChange={e => onDataChange(field, localToIso(e.target.value))}
                      className="block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold p-2"
                    />
                  </div>
                ) : (field === 'invoice_total') ? (
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={data[field] || ""}
                      onChange={e => onDataChange(field, e.target.value)}
                      className="mt-1 block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold p-2"
                    />
                    {requiredErrors.invoice_total && (
                      <div className="text-red-600 text-sm mt-1">{requiredErrors.invoice_total}</div>
                    )}
                  </div>
                ) : (field === 'customer_address') ? (
                  <div>
                    <textarea
                      value={data[field] || ""}
                      onChange={e => onDataChange(field, e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold p-2"
                    />
                  </div>
                ) : (field === 'item_description') ? (
                  <div>
                    <textarea
                      value={data[field] || ""}
                      onChange={e => onDataChange(field, e.target.value)}
                      rows={2}
                      className="mt-1 block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold p-2"
                    />
                  </div>
                ) : (
                  // Generic editable field (including item_unit_price, item_total_price, etc.)
                  <input
                    type="text"
                    value={data[field] || ""}
                    onChange={e => onDataChange(field, e.target.value)}
                    className="mt-1 block w-full border-[#2F86A6]/30 rounded-md shadow-sm focus:ring-[#2F86A6] focus:border-[#2F86A6] bg-[#2F86A6]/10 text-[#0F172A] font-bold p-2"
                  />
                )
              ) : (
                // Non-edit display mode: keep previous rendering behavior
                field === "customer_address" ? (
                  <div className="mt-1">
                    {/* Split address into lines for readability */}
                    {(data[field] || "")
                      .split(/,\s*/)
                      .map((part, idx) => (
                        <div key={idx} className="text-[#0F172A] font-semibold">{part}</div>
                      ))}
                  </div>
                ) : field === "due_date" ? (
                  <p className="mt-1 text-sm text-[#0F172A] font-semibold">{displayISO(getEffectiveDueDate())}</p>
                ) : field === "invoice_date" ? (
                  <p className="mt-1 text-sm text-[#0F172A] font-semibold">{displayISO(data[field])}</p>
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
                )
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
              <button onClick={handleShowSummary} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-4 rounded-2xl font-bold hover:scale-105 transition-all" disabled={!getEffectiveDueDate()}>Save Invoice</button>
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
                {/* Always show the effective due date in summary */}
                <div className="flex justify-between">
                  <span className="font-semibold text-[#2F86A6]">Due Date</span>
                  <span className="text-[#0F172A]">{displayISO(getEffectiveDueDate())}</span>
                </div>
                {Object.entries(data)
                  .filter(([key]) => !key.startsWith("model_label_") && key !== "DocumentType" && key !== "ExpenseType" && key !== "due_date")
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-semibold text-[#2F86A6]">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-[#0F172A]">{key === 'invoice_date' ? displayISO(value) : String(value)}</span>
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
