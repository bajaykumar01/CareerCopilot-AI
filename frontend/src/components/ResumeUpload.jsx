import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { resumeAPI } from '../services/api';

const ResumeUpload = ({ onUploadSuccess }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const processFile = async (uploadedFile) => {
    if (!uploadedFile.name.endsWith('.pdf')) {
      setError('Only PDF resumes are supported.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await resumeAPI.upload(uploadedFile);
      setFile(uploadedFile);
      onUploadSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and parse PDF. Ensure it has readable text.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-slate-805 bg-slate-800/20 hover:border-brand-500/50 hover:bg-slate-800/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
            <p className="text-sm font-semibold text-slate-300">Extracting resume text...</p>
            <p className="text-xs text-slate-500">Parsing multi-page document structure</p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200 flex items-center justify-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-400" />
                {file.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">Successfully parsed. Click to upload a different resume.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-4 bg-brand-500/10 text-brand-400 rounded-2xl shadow-inner shadow-brand-500/10">
              <UploadCloud className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-250">Drag and drop your PDF resume, or browse</p>
              <p className="text-xs text-slate-500 mt-1.5">Support multi-page PDF documents. Max size 10MB.</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-950/20 border border-red-500/25 text-red-400 rounded-xl text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
