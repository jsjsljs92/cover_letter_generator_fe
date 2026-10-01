import React from 'react';
import { JobInputMode } from '../types/coverLetter';
import { JobUrlInput } from './JobUrlInput';
import { JobDescriptionInput } from './JobDescriptionInput';
import { Globe, FileText, Sparkles } from 'lucide-react';

interface JobInputProps {
  mode: JobInputMode;
  onModeChange: (mode: JobInputMode) => void;
  jobUrl: string;
  onJobUrlChange: (url: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (desc: string) => void;
  urlError?: string;
  descError?: string;
  disabled?: boolean;
}

const SAMPLE_JOB_URL = 'https://jobs.example.com/senior-frontend-engineer';
const SAMPLE_JOB_DESC = `Senior Frontend Engineer
Company: Acme Cloud Solutions
Location: Remote (US / Global)

About the Role:
We are seeking an experienced Senior Frontend Engineer to build high-performance, accessible, and intuitive web applications. You will collaborate closely with product designers, backend engineers, and product managers to deliver world-class experiences.

Responsibilities:
• Architect clean, maintainable, and type-safe user interfaces with React and TypeScript.
• Build responsive and accessible interfaces compliant with WCAG AA standards.
• Optimize client-side performance, state management, and real-time data flows.
• Collaborate with backend engineers to integrate robust REST and GraphQL APIs.

Requirements:
• 4+ years of professional experience building modern web applications.
• Deep proficiency with TypeScript, React, and modern CSS frameworks (Tailwind).
• Strong track record with component-driven architecture and automated testing.
• Exceptional communication skills and passion for craft and user experience.`;

export const JobInput: React.FC<JobInputProps> = ({
  mode,
  onModeChange,
  jobUrl,
  onJobUrlChange,
  jobDescription,
  onJobDescriptionChange,
  urlError,
  descError,
  disabled = false,
}) => {
  const handleFillSample = () => {
    if (mode === 'url') {
      onJobUrlChange(SAMPLE_JOB_URL);
    } else {
      onJobDescriptionChange(SAMPLE_JOB_DESC);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div
          role="tablist"
          aria-label="Job input method"
          className="inline-flex p-1 bg-neutral-100 rounded-lg border border-neutral-200/80"
        >
          <button
            type="button"
            role="tab"
            id="tab-job-url"
            aria-selected={mode === 'url'}
            aria-controls="panel-job-url"
            onClick={() => onModeChange('url')}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
              mode === 'url'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Job URL</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-job-desc"
            aria-selected={mode === 'description'}
            aria-controls="panel-job-desc"
            onClick={() => onModeChange('description')}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
              mode === 'description'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Job Description</span>
          </button>
        </div>

        {/* Quick Sample Action */}
        <button
          type="button"
          onClick={handleFillSample}
          disabled={disabled}
          className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors self-start sm:self-auto py-1"
        >
          <Sparkles className="w-3 h-3 text-neutral-400" />
          <span>Insert sample {mode === 'url' ? 'URL' : 'description'}</span>
        </button>
      </div>

      {/* Mode Panels */}
      <div
        id="panel-job-url"
        role="tabpanel"
        aria-labelledby="tab-job-url"
        hidden={mode !== 'url'}
      >
        {mode === 'url' && (
          <JobUrlInput
            value={jobUrl}
            onChange={onJobUrlChange}
            error={urlError}
            disabled={disabled}
          />
        )}
      </div>

      <div
        id="panel-job-desc"
        role="tabpanel"
        aria-labelledby="tab-job-desc"
        hidden={mode !== 'description'}
      >
        {mode === 'description' && (
          <JobDescriptionInput
            value={jobDescription}
            onChange={onJobDescriptionChange}
            error={descError}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
