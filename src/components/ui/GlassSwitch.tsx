'use client';

import { cn } from '@/lib/utils/cn';

interface GlassSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function GlassSwitch({ checked, onChange, label, disabled }: GlassSwitchProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300',
          'backdrop-blur-xl border',
          checked ? 'bg-primary-600/50 border-primary-500/50' : 'bg-white/10 border-white/20',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  );
}
