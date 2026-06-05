'use client';

import { cn } from '@/lib/helpers';
import { InputHTMLAttributes, forwardRef } from 'react';

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        ref={ref}
        className={cn('w-4 h-4 accent-primary-600', className)}
        {...props}
      />
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  )
);

Radio.displayName = 'Radio';
