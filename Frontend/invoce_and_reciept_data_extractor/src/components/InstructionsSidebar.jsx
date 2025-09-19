"use client";

const InstructionsSidebar = () => (
  <aside className="w-80 min-w-[18rem] max-w-xs bg-gradient-to-br from-[#E0F2FE] to-[#F0FFF0] border-2 border-[#34BE82]/30 rounded-2xl p-6 shadow-lg flex flex-col items-center animate-fade-in">
    <div className="w-full flex items-center gap-3 mb-4">
      <svg className="w-10 h-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="#2F86A6" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
      <h2 className="text-xl font-bold text-[#2F86A6]">How to Upload Your Receipt/Invoice</h2>
    </div>
    <ol className="list-decimal ml-6 text-left text-[#0F172A] font-medium space-y-3">
      <li className="flex items-center gap-2">
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="#34BE82" strokeWidth="2"><circle cx="12" cy="12" r="10" stroke="#34BE82" strokeWidth="2" fill="#E0F2FE" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
        <span>Click <b>Select Files</b> or drag & drop your document into the box.</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="#2F86A6" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" fill="#BAE6FD" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" /></svg>
        <span>Wait for the upload and extraction to complete.</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="#34BE82" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        <span>Review the extracted data in the sidebar.</span>
      </li>
      <li className="flex items-center gap-2">
        <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="#2F86A6" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" fill="#BAE6FD" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" /></svg>
        <span>Edit any fields if needed and save your changes.</span>
      </li>
    </ol>
    <div className="mt-6 text-sm text-[#2F86A6] text-center">Supported formats: PDF, JPG, JPEG, PNG</div>
  </aside>
);

export default InstructionsSidebar;
