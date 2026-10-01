import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { formatFileSize } from '../utils/formatters';

interface ResumeUploaderProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
  onErrorChange?: (error?: string) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  file,
  onFileSelect,
  error,
  onErrorChange,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (candidate: File | null) => {
    if (!candidate) {
      onFileSelect(null);
      return;
    }

    const isPdf =
      candidate.type === 'application/pdf' ||
      candidate.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      if (onErrorChange) {
        onErrorChange('Please upload a PDF file (.pdf). Other formats are not supported.');
      }
      return;
    }

    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      if (onErrorChange) {
        onErrorChange(`File size exceeds 10 MB limit (${formatFileSize(candidate.size)}).`);
      }
      return;
    }

    if (onErrorChange) {
      onErrorChange(undefined);
    }
    onFileSelect(candidate);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
    // reset input value so re-uploading the same file works if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (onErrorChange) {
      onErrorChange(undefined);
    }
  };

  const handleUseSampleResume = () => {
    // Generate a minimal valid dummy PDF file for instant testing
    const samplePdfContent = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF`;
    const blob = new Blob([samplePdfContent], { type: 'application/pdf' });
    const sampleFile = new File([blob], 'Jia_Sheng_Senior_Engineer_Resume.pdf', {
      type: 'application/pdf',
      lastModified: Date.now(),
    });
    validateAndSetFile(sampleFile);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          id="resume-upload-label"
          className="block text-sm font-medium text-neutral-800"
        >
          Resume
        </label>
        {!file && (
          <button
            type="button"
            onClick={handleUseSampleResume}
            disabled={disabled}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-neutral-400" />
            <span>Use sample resume</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id="resume-file-input"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
        aria-labelledby="resume-upload-label"
        aria-describedby={error ? 'resume-error' : 'resume-hint'}
      />

      {file ? (
        /* Uploaded State */
        <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl shadow-xs transition-all">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-900 truncate">
                  {file.name}
                </span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:opacity-50"
            aria-label={`Remove uploaded resume file ${file.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      ) : (
        /* Drag & Drop State */
        <div
          role="region"
          aria-label="Upload your resume PDF"
          tabIndex={disabled ? -1 : 0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 outline-none
            ${
              isDragging
                ? 'border-neutral-900 bg-neutral-100/80 scale-[0.995]'
                : error
                ? 'border-red-300 bg-red-50/20 hover:border-red-400'
                : 'border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50/50'
            }
            ${disabled ? 'opacity-60 cursor-not-allowed bg-neutral-50' : 'focus-visible:ring-2 focus-visible:ring-neutral-900'}
          `}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-900">
                Upload your resume
              </p>
              <p className="text-xs text-neutral-500">
                Drag &amp; drop your PDF here or{' '}
                <span className="font-semibold text-neutral-900 underline underline-offset-2">
                  Browse Files
                </span>
              </p>
            </div>

            <p id="resume-hint" className="text-xs text-neutral-400">
              PDF up to 10 MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p
          id="resume-error"
          role="alert"
          className="text-xs font-medium text-red-600 flex items-center gap-1.5 mt-1"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
