import React from 'react';
import { AlertCircle } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="job-description-input"
          className="block text-sm font-medium text-neutral-800"
        >
          Job Description
        </label>
        <span className="text-xs text-neutral-500 tabular-nums">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
      </div>

      <textarea
        id="job-description-input"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here, including responsibilities and requirements..."
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? 'job-desc-error' : 'job-desc-hint'}
        className={`w-full px-3.5 py-3 text-sm bg-white rounded-lg border transition-all duration-150 outline-none resize-y leading-relaxed
          ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-neutral-900'
              : 'border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 text-neutral-900'
          }
          ${disabled ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed' : ''}
        `}
      />

      {error ? (
        <p
          id="job-desc-error"
          role="alert"
          className="text-xs font-medium text-red-600 flex items-center gap-1.5 mt-1"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : (
        <p id="job-desc-hint" className="text-xs text-neutral-500 mt-1">
          Include key requirements, responsibilities, or company details for the best alignment.
        </p>
      )}
    </div>
  );
};
