'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-white/10 border-white/20 text-gray-300',
  success: 'bg-green-500/20 border-green-500/30 text-green-400',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function GlassBadge({ children, variant = 'default', size = 'sm', className }: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full backdrop-blur-sm border font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
