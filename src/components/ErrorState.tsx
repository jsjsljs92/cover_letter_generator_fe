import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, Settings } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
  onBackToForm: () => void;
  onOpenSettings?: () => void;
  message?: string;
  isConnectionError?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  onRetry,
  onBackToForm,
  onOpenSettings,
  message,
  isConnectionError,
}) => {
  return (
    <div
      role="alert"
      className="w-full max-w-xl mx-auto bg-white border border-neutral-200 rounded-2xl p-8 sm:p-10 shadow-xs text-center space-y-6"
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Something went wrong
        </h2>
        <p className="text-sm text-neutral-600 max-w-md mx-auto">
          We couldn&apos;t generate your cover letter.
        </p>

        {isConnectionError ? (
          <p className="text-xs text-neutral-500 max-w-sm mx-auto pt-1 leading-relaxed">
            The local Go backend could not be reached. Please check that the server is running on the configured port.
          </p>
        ) : message ? (
          <p className="text-xs text-neutral-500 max-w-sm mx-auto pt-1">
            {message}
          </p>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-950 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-neutral-950"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <button
          type="button"
          onClick={onBackToForm}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors border border-neutral-200/60 focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Form</span>
        </button>
      </div>

      {onOpenSettings && isConnectionError && (
        <div className="pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 underline underline-offset-2 transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>Change Backend URL</span>
          </button>
        </div>
      )}
    </div>
  );
};
