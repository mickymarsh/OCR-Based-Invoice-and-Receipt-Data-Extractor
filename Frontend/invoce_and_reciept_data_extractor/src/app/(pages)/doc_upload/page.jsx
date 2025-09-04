'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

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
        setExtractedData(data[0]);  // Assuming single file for now
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="mt-2 text-sm text-gray-600">Upload receipts and invoices to extract structured data</p>
        </div>

        {/* Drag and Drop File Upload Section */}
        <div
          className={`border-2 border-blue-400 bg-blue-50 rounded-lg p-6 mb-8 shadow-sm transition-all ${dragActive ? 'border-blue-700 bg-blue-100' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex-1">
              <label className="block text-base font-semibold text-gray-700 mb-2">File Upload</label>
            </div>
            <div className="flex-1 flex justify-center">
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="inline-block bg-blue-600 text-white font-semibold py-2 px-6 rounded cursor-pointer hover:bg-blue-700 transition-all">
                Select Files
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <div className="w-full text-center text-blue-700 font-semibold">
              Drag & Drop files here
            </div>
          </div>
          {/* Action bar like screenshot */}
          <div className="mt-4 bg-blue-600 rounded-b-lg px-4 py-2 flex items-center space-x-4 text-white text-sm">
            <span className="font-bold">+ |</span>
            <button type="button" className="hover:underline">Edit</button>
            <button type="button" className="hover:underline">Copy</button>
            <button type="button" className="hover:underline">Remove</button>
          </div>
          {/* Show selected files */}
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
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload and Extract'}
            </button>
          </div>
        </div>

        {/* Sidebar for extracted data */}
        {sidebarOpen && extractedData && (
          <div className="fixed top-0 right-0 h-full w-96 bg-blue-50 shadow-xl z-50 transition-transform duration-300 flex flex-col" style={{transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)'}}>
            <div className="flex justify-between items-center p-4 border-b border-blue-200">
              <h2 className="text-xl font-semibold text-blue-900">Extracted Data</h2>
              <button onClick={closeSidebar} className="text-blue-600 hover:text-blue-800 font-bold text-lg">&times;</button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto min-h-0">
              <div className="grid grid-cols-1 gap-4">
                {["Address","Date","Item","OrderId","Subtotal","Tax","Title","TotalPrice"].map((field) => (
                  <div key={field} className="mb-4">
                    <label className="block text-sm font-medium text-blue-700 capitalize">{field}</label>
                    {editing ? (
                      <input
                        type="text"
                        value={extractedData?.[field] || ""}
                        onChange={(e) => handleDataChange(field, e.target.value)}
                        className="mt-1 block w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-100 text-blue-900 font-bold"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-blue-900">{extractedData?.[field] || ""}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
                {editing && (
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
