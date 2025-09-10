"use client";

import { useState, useEffect } from 'react';
import InvoiceSidebar from '../../components/InvoiceSidebar';
import ReceiptSidebar from '../../components/ReceiptSidebar';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Log extractedData to console whenever it changes
  useEffect(() => {
    if (extractedData) {
      console.log('Extracted Data:', extractedData);
      // Print all keys and values for debugging
      Object.entries(extractedData).forEach(([key, value]) => {
        console.log(`Field: ${key}, Value: ${value}`);
      });
    }
  }, [extractedData]);

  useEffect(() => {
    if (files && files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
      return () => {
        try { URL.revokeObjectURL(url); } catch (e) {}
        setPreviewUrl(null);
      };
    }
    setPreviewUrl(null);
  }, [files]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUpload = async () => {
    console.log('Uploading files:', files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        
  setExtractedData(data[0]);  // Use first item from array
  console.log('Extracted Data:', data[0]);
        setSidebarOpen(true);
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = () => {
    setEditing(!editing);
  };

  const handleSave = () => {
    setEditing(false);
    alert('Data saved!');
  };

  const handleDataChange = (key, value) => {
    setExtractedData(prev => ({ ...prev, [key]: value }));
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
  <div className="min-h-screen bg-gray-50 py-12 pl-4 pr-0 sm:pl-6 lg:pl-8">
      <div className="w-full flex gap-6">
        {/* Left content column */}
        <div className="flex-1">
          <div className="text-left mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
            <p className="mt-2 text-sm text-gray-600">Upload receipts and invoices to extract structured data</p>
          </div>

          <div className="border-2 border-blue-400 bg-blue-50 rounded-lg p-6 mb-6 shadow-sm transition-all" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            <div className="flex items-center justify-between">
              <label className="block text-base font-semibold text-gray-700 mb-2">File Upload</label>
              <div>
                <input id="file-upload" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                <label htmlFor="file-upload" className="inline-block bg-blue-600 text-white font-semibold py-2 px-6 rounded cursor-pointer hover:bg-blue-700 transition-all">Select Files</label>
              </div>
            </div>
            <div className="mt-4">
              <div className={`w-full text-center text-blue-700 font-semibold ${dragActive ? 'bg-blue-100' : ''}`}>Drag & Drop files here</div>
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-gray-700">Selected Files:</span>
                <ul className="list-disc ml-6">
                  {files.map((file, idx) => (
                    <li key={idx} className="text-gray-800 text-sm">{file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={handleUpload} disabled={uploading || files.length === 0} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload and Extract'}</button>
            </div>
          </div>

          {/* Preview area (left) */}
          <div className="rounded-lg p-2 bg-white shadow-sm flex items-center justify-center">
            {previewUrl ? (
              // smaller responsive preview: full width on very small screens, fixed 20rem width on sm+
              <img src={previewUrl} alt="Preview" className="w-full sm:w-80 h-80 object-contain rounded" />
            ) : (
              <div className="w-full h-80 flex items-center justify-center text-gray-400">No preview available</div>
            )}
          </div>
        </div>

        {/* Right sidebar: conditionally render InvoiceSidebar or ReceiptSidebar */}
        {sidebarOpen && extractedData && extractedData.DocumentType === 'invoice' && (
          <InvoiceSidebar
            data={extractedData}
            editing={editing}
            onEdit={handleEdit}
            onSave={handleSave}
            onDataChange={handleDataChange}
            onClose={closeSidebar}
          />
        )}
        {sidebarOpen && extractedData && extractedData.DocumentType === 'receipt' && (
          <ReceiptSidebar
            data={extractedData}
            editing={editing}
            onEdit={handleEdit}
            onSave={handleSave}
            onDataChange={handleDataChange}
            onClose={closeSidebar}
          />
        )}
      </div>
    </div>
  );
}
