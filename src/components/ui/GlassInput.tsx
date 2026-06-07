'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, icon, ...props }, ref) => (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full backdrop-blur-xl bg-white/5 border rounded-xl px-4 py-3 text-white',
            'placeholder:text-gray-400 focus:outline-none focus:border-primary-500/50',
            'focus:ring-2 focus:ring-primary-500/20 transition-all duration-300',
            icon ? 'pl-10' : 'pl-4',
            error ? 'border-red-500/50' : 'border-white/10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
);

GlassInput.displayName = 'GlassInput';
