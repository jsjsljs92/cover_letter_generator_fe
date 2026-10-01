import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { ProgressStep } from '../types/coverLetter';

interface GenerationProgressProps {
  steps: ProgressStep[];
  currentStatusText?: string;
  elapsedSeconds?: number;
  onCancel?: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  steps,
  currentStatusText,
  elapsedSeconds = 0,
  onCancel,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-xl mx-auto bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs"
    >
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 mb-3">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
          Generating your cover letter
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          {currentStatusText || 'Our AI engine is synthesizing your resume experience with the target job requirements.'}
        </p>
      </div>

      {/* Progress Steps List */}
      <div className="space-y-3.5 max-w-sm mx-auto mb-8">
        {steps.map((step) => {
          const isDone = step.status === 'done';
          const isActive = step.status === 'active';
          const isPending = step.status === 'pending';

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3.5 transition-colors duration-200 ${
                isPending ? 'text-neutral-400' : 'text-neutral-900'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isActive ? (
                  <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900 opacity-30" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neutral-900" />
                  </span>
                ) : (
                  <Circle className="w-4 h-4 text-neutral-300" />
                )}
              </div>

              <span
                className={`text-sm ${
                  isActive
                    ? 'font-semibold text-neutral-900'
                    : isDone
                    ? 'font-medium text-neutral-800'
                    : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span className="tabular-nums">
          Processing... {elapsedSeconds > 0 && `(${elapsedSeconds}s)`}
        </span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-neutral-500 hover:text-neutral-800 transition-colors underline underline-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
