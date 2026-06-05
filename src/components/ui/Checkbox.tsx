'use client';

import { cn } from '@/lib/helpers';
import { Check } from 'lucide-react';
import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          className="peer sr-only"
          {...props}
        />
        <div className="w-5 h-5 border-2 border-gray-600 rounded peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-colors" />
        <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  )
);

Checkbox.displayName = 'Checkbox';
