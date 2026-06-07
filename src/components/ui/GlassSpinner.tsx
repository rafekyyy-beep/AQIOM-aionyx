'use client';

import { cn } from '@/lib/utils/cn';

interface GlassSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export function GlassSpinner({ size = 'md', className }: GlassSpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full animate-spin backdrop-blur-sm',
        'border-primary-500/50 border-t-primary-500',
        sizes[size],
        className
      )}
    />
  );
}
