import React from 'react';
import { FileText, Server, ExternalLink } from 'lucide-react';
import { getApiBaseUrl } from '../api/coverLetters';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const apiUrl = getApiBaseUrl();

  return (
    <header className="border-b border-neutral-200/80 bg-white sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <a
            href="/"
            className="text-base font-semibold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors"
          >
            AI Cover Letter
          </a>
        </div>

        {/* Zone 2: Navigation links */}
        <nav
          aria-label="Main Navigation"
          className="hidden sm:flex items-center gap-6 text-sm text-neutral-600"
        >
          <a
            href="#how-it-works"
            className="hover:text-neutral-900 transition-colors"
          >
            How it works
          </a>
          <a
            href="#tones"
            className="hover:text-neutral-900 transition-colors"
          >
            Tones
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors"
          >
            Documentation
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </nav>

        {/* Zone 3: Actions & backend status indicator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors border border-neutral-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            title="Configure Go Backend URL"
          >
            <Server className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden md:inline text-neutral-500">API:</span>
            <span className="font-mono text-[11px] truncate max-w-[120px]">
              {apiUrl.replace(/^https?:\/\//, '')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
