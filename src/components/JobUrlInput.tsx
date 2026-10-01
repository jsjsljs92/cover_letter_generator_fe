import React from 'react';
import { Globe, AlertCircle } from 'lucide-react';

interface JobUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const JobUrlInput: React.FC<JobUrlInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="job-url-input"
          className="block text-sm font-medium text-neutral-800"
        >
          Job URL
        </label>
        <span className="text-xs text-neutral-500">
          LinkedIn, Indeed, greenhouse.io, etc.
        </span>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
          <Globe className="w-4 h-4" />
        </div>
        <input
          id="job-url-input"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/jobs/software-engineer"
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? 'job-url-error' : 'job-url-hint'}
          className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white rounded-lg border transition-all duration-150 outline-none
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-neutral-900'
                : 'border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 text-neutral-900'
            }
            ${disabled ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed' : ''}
          `}
        />
      </div>

      {error ? (
        <p
          id="job-url-error"
          role="alert"
          className="text-xs font-medium text-red-600 flex items-center gap-1.5 mt-1"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : (
        <p id="job-url-hint" className="text-xs text-neutral-500 mt-1">
          Paste the direct link to the published job listing.
        </p>
      )}
    </div>
  );
};
