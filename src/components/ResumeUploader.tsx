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

/**
 * Builds a small but genuinely valid PDF with an extractable text layer.
 *
 * It exists so "Use sample resume" produces a file the backend's parser can
 * actually read. A hand-written stub passes the `%PDF-` magic check but
 * extracts no text, and the server rejects it as an image-only PDF.
 *
 * The xref table stores byte offsets, so the object bodies are assembled first
 * and their lengths measured; writing a fixed table would produce a file that
 * most readers reject.
 */
function buildSampleResumePdf(): Blob {
  const lines = [
    'Jia Sheng',
    'Senior Software Engineer',
    'SUMMARY',
    'Senior engineer with eight years building distributed web platforms and',
    'design systems. Focused on TypeScript, React, and API design.',
    'EXPERIENCE',
    'Staff Engineer, Northwind Systems (2021 - present)',
    'Led the migration of a monolithic dashboard to a typed component platform',
    'serving 40k daily users, cutting bundle size by 38 percent.',
    'Designed the public REST and GraphQL API layer adopted by four teams.',
    'Software Engineer, Contoso (2018 - 2021)',
    'Built an accessibility review pipeline now run on every release.',
    'SKILLS',
    'TypeScript, React, Go, PostgreSQL, Kubernetes, accessibility, performance.',
  ];

  // One BT/ET block per line, positioned down the page. Separate text-showing
  // operators land on distinct lines in the extracted text.
  const textOps = lines
    .map((line, i) => `BT /F1 11 Tf 1 0 0 1 60 ${740 - i * 30} Tm (${escapePdfText(line)}) Tj ET`)
    .join('\n');
  const contentStream = `${textOps}\n`;

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    // /Length is a byte count. String.length counts UTF-16 units, which only
    // matches because every character written here is ASCII.
    `<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  // Byte offsets for the xref table. Also ASCII-only, so string length is the
  // byte offset.
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return new Blob([pdf], { type: 'application/pdf' });
}

/** Escapes the three characters that are structural inside a PDF literal string. */
function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

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
    // A stub with no text layer is rejected by the backend: the PDF parser
    // extracts text and refuses anything under its minimum readable length, so
    // the sample must carry a real text-drawing operator stream.
    const sampleFile = new File([buildSampleResumePdf()], 'Jia_Sheng_Senior_Engineer_Resume.pdf', {
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
