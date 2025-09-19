"use client";

import { useState, useEffect } from 'react';
import InvoiceSidebar from '../../../components/InvoiceSidebar';
import ReceiptSidebar from '../../../components/ReceiptSidebar';
import Header from '../../../components/Header';
import InstructionsSidebar from '../../../components/InstructionsSidebar';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  
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

      
      if (response.ok) {
        const data = await response.json();
        
  setExtractedData(data[0]);  // Use first item from array
  
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <div className="py-12 pl-4 pr-0 sm:pl-6 lg:pl-8 w-full flex gap-6">
        {/* Left sidebar column */}
        <InstructionsSidebar />
        <div className="flex-1 flex flex-col gap-6">
          <div className="text-left mb-6">
            <h1 className="text-3xl font-bold text-[#0F172A] drop-shadow">Upload Documents</h1>
            <p className="mt-2 text-sm text-[#2F86A6]">Upload receipts and invoices to extract structured data</p>
          </div>

          <div className="border-2 border-[#3341551a] bg-white rounded-2xl p-8 mb-6 shadow-lg transition-all" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            <div className="flex items-center justify-between">
              <label className="block text-base font-bold text-[#0F172A] mb-2">File Upload</label>
              <div>
                <input id="file-upload" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                <label htmlFor="file-upload" className="inline-block bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white font-bold py-2 px-6 rounded-2xl cursor-pointer hover:scale-105 transition-all">Select Files</label>
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center justify-center">
              {/* Document upload illustration */}
              <img src="/upload-document-illustration-svg-download-png-8051288.webp" alt="Upload Document" className="mx-auto mb-2 w-32 h-32 object-contain" style={{ filter: 'contrast(0.85) brightness(1.2)' }} />
              <div className={`w-full text-center text-[#2F86A6] font-bold ${dragActive ? 'bg-[#2F86A6]/10' : ''}`}>Drag & Drop files here</div>
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-[#0F172A] font-bold">Selected Files:</span>
                <ul className="list-disc ml-6">
                  {files.map((file, idx) => (
                    <li key={idx} className="text-[#2F86A6] text-sm font-semibold">{file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={handleUpload} disabled={uploading || files.length === 0} className="bg-gradient-to-br from-[#2F86A6] to-[#34BE82] text-white py-2 px-6 rounded-2xl font-bold hover:scale-105 transition-all disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload and Extract'}</button>
            </div>
          </div>

          {/* Preview area (left) */}
          <div className="rounded-2xl p-4 bg-white shadow-lg flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full sm:w-80 h-80 object-contain rounded-2xl border-2 border-[#2F86A6]/20" />
            ) : (
              <div className="w-full h-80 flex items-center justify-center text-[#2F86A6]/50 font-bold">No preview available</div>
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
