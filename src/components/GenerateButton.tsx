import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  disabledReason?: string;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  disabledReason,
}) => {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`w-full h-12 inline-flex items-center justify-center gap-2.5 px-6 rounded-xl font-medium text-sm transition-all duration-150 outline-none
          ${
            disabled || isLoading
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-200'
              : 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-sm active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="whitespace-nowrap">Submitting Request...</span>
          </>
        ) : (
          <>
            <span className="whitespace-nowrap">Generate Cover Letter</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </>
        )}
      </button>

      {disabled && disabledReason && (
        <p className="text-center text-xs text-neutral-400">
          {disabledReason}
        </p>
      )}
    </div>
  );
};
