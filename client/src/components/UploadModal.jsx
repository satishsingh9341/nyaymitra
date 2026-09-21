import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | analyzing | error

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && uploadState !== 'analyzing') {
        resetModal();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, uploadState]);

  if (!isOpen) return null;

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return;

    // Check size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File size exceeds the 10MB maximum limit.');
      return;
    }

    // Check extension
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const filename = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => filename.endsWith(ext));

    if (!isValid) {
      setError('Unsupported file type. NyayMitra accepts PDF, DOCX, and TXT files only.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    try {
      setUploadState('uploading');
      setError(null);

      const formData = new FormData();
      formData.append('document', selectedFile);

      // Transition to analyzing indicator
      setTimeout(() => {
        setUploadState('analyzing');
      }, 1200);

      const token = user?.token || 'mock-firebase-token-demo-user-12345';
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload and parse document.');
      }

      const createdDoc = await response.json();
      onClose();
      // Redirect to Document Detail view per PRD 5.4
      navigate(`/document/${createdDoc.id}`);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadState('error');
      setError(err.message || 'An error occurred during upload. Please try again.');
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setError(null);
    setUploadState('idle');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy900/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-bgSurface border border-borderDefault rounded shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderDefault">
          <div>
            <h2 id="upload-dialog-title" className="text-xl font-serif font-bold text-navy900">
              Upload Legal Document
            </h2>
            <p className="text-xs text-slate700 mt-0.5">
              Secure in-memory analysis. Raw files are never stored.
            </p>
          </div>
          <button
            onClick={resetModal}
            disabled={uploadState === 'analyzing'}
            className="p-1 rounded hover:bg-bgPrimary text-slate400 hover:text-navy900 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-riskHigh text-xs rounded flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload States */}
        {uploadState === 'idle' || uploadState === 'error' ? (
          <div className="mt-6 space-y-4">
            {/* Drag and drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-accent bg-blue-50/50'
                  : 'border-borderDefault hover:border-slate400 bg-bgPrimary/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-blue-50 text-accent flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-navy900">
                  <FileText className="w-4 h-4 text-accent" />
                  <span className="truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-xs text-slate400">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-navy900 mb-1">
                    Drag and drop your document here, or <span className="text-accent underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate400">
                    Accepts PDF, DOCX, and TXT (up to 10MB)
                  </p>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderDefault">
              <button
                type="button"
                onClick={resetModal}
                className="px-4 py-2 text-sm text-slate700 hover:bg-bgPrimary rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={!selectedFile}
                className="px-5 py-2 bg-accent hover:bg-blue-700 text-bgSurface text-sm font-medium rounded shadow-subtle transition-colors disabled:opacity-50"
              >
                Analyze Document
              </button>
            </div>
          </div>
        ) : (
          /* Progress & Parsing States */
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
            <div>
              <h3 className="text-lg font-serif font-bold text-navy900">
                {uploadState === 'uploading' ? 'Extracting document text...' : 'Gemini AI is analyzing clauses & risks...'}
              </h3>
              <p className="text-xs text-slate700 mt-1 max-w-sm mx-auto">
                {uploadState === 'uploading'
                  ? 'Parsing in-memory and preparing section breakdowns.'
                  : 'Evaluating payment terms, liabilities, termination clauses, and lawyer questions.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
