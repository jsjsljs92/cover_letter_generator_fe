import React from 'react';
import { ToneOption } from '../types/coverLetter';
import { ChevronDown } from 'lucide-react';

interface ToneSelectorProps {
  value: ToneOption;
  onChange: (tone: ToneOption) => void;
  disabled?: boolean;
}

const TONE_OPTIONS: { id: ToneOption; label: string; desc: string }[] = [
  {
    id: 'professional',
    label: 'Professional',
    desc: 'Formal, polished, and executive tone suited for corporate roles.',
  },
  {
    id: 'friendly',
    label: 'Friendly',
    desc: 'Warm, personable, and collaborative tone for modern teams.',
  },
  {
    id: 'concise',
    label: 'Concise',
    desc: 'Direct, crisp, and high-impact with minimal filler.',
  },
  {
    id: 'technical',
    label: 'Technical',
    desc: 'Data-driven and skills-focused highlighting architectural mastery.',
  },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const currentTone = TONE_OPTIONS.find((t) => t.id === value) || TONE_OPTIONS[0];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="tone-selector"
          className="block text-sm font-medium text-neutral-800"
        >
          Tone
        </label>
        <span className="text-xs text-neutral-500">
          Optional style guideline
        </span>
      </div>

      <div className="relative">
        <select
          id="tone-selector"
          value={value}
          onChange={(e) => onChange(e.target.value as ToneOption)}
          disabled={disabled}
          aria-describedby="tone-hint"
          className="w-full appearance-none bg-white border border-neutral-300 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-neutral-900 font-medium cursor-pointer transition-all duration-150 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed"
        >
          {TONE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      <p id="tone-hint" className="text-xs text-neutral-500">
        {currentTone.desc}
      </p>
    </div>
  );
};
