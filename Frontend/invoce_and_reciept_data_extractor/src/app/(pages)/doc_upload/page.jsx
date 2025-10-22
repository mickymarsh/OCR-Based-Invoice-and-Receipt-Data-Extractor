"use client";

import { useState, useEffect } from 'react';
import InvoiceSidebar from '../../../components/InvoiceSidebar';
import ReceiptSidebar from '../../../components/ReceiptSidebar';
import Header from '../../../components/Header';
import InstructionsSidebar from '../../../components/InstructionsSidebar';
import Footer from '@/components/Footer';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  
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
  
  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Set initial status
    setIsOnline(navigator.onLine);
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const handleUpload = async () => {
    console.log('Uploading files:', files);
    if (files.length === 0) return;

    // Reset any previous error messages
    setErrorMessage('');
    setShowError(false);
    setUploading(true);

    // Check if network is available
    if (!isOnline) {
      setErrorMessage("Network connection unavailable. Please check your internet connection and try again.");
      setShowError(true);
      setUploading(false);
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    console.log(formData);

    try {
      // Add timeout to the fetch request to detect network issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 60 second timeout
      
      const response = await fetch('http://127.0.0.1:8000/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if request completes
      
      if (response.ok) {
        const data = await response.json();
        setExtractedData(data[0]);  // Use first item from array
        setSidebarOpen(true);
      } else {
        setErrorMessage(`Upload failed: ${response.status} ${response.statusText}`);
        setShowError(true);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      
      // Handle specific network-related errors
      if (error.name === 'AbortError') {
        setErrorMessage("Request timed out. The server might be down or your connection is too slow. Please try again later.");
      } else if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        // Mark as offline if we detected a network error
        setIsOnline(false);
        setErrorMessage("Network connection error. Please check your internet connection and try again.");
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        setErrorMessage("Unable to connect to server. The server might be down or not running.");
      } else if (!navigator.onLine) {
        setIsOnline(false);
        setErrorMessage("You are currently offline. Please reconnect to the internet and try again.");
      } else {
        setErrorMessage(`Error uploading: ${error.message}`);
      }
      
      setShowError(true);
      
      // Automatically retry connection check after 5 seconds
      if (!isOnline) {
        setTimeout(() => {
          setIsOnline(navigator.onLine);
        }, 5000);
      }
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

          {/* Network status indicator */}
          <div className={`mb-4 p-2 px-4 rounded-full inline-flex items-center ${isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} border ${isOnline ? 'border-green-300' : 'border-red-300'}`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isOnline ? 'Connected to network' : 'Network unavailable - Check your connection'}
            </span>
          </div>

          {/* Error message alert */}
          {showError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Network Error</h3>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  {files.length > 0 && (
                    <div className="mt-2">
                      <button 
                        onClick={handleUpload}
                        disabled={!isOnline || uploading}
                        className="text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded-md disabled:opacity-50"
                      >
                        {uploading ? 'Trying...' : 'Retry Upload'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setShowError(false)}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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

        {/* Right sidebar: conditionally render InvoiceSidebar or ReceiptSidebar, pass expense type */}
        {sidebarOpen && extractedData && extractedData.DocumentType === 'invoice' && (
          <InvoiceSidebar
            data={extractedData}
            editing={editing}
            onEdit={handleEdit}
            onSave={handleSave}
            onDataChange={handleDataChange}
            onClose={closeSidebar}
            expenseType={extractedData.ExpenseType}
            expenseTypeDropdown={editing}
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
            expenseType={extractedData.ExpenseType}
            expenseTypeDropdown={editing}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
