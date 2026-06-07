'use client';

import { cn } from '@/lib/utils/cn';

interface GlassDividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export function GlassDivider({ className, orientation = 'horizontal', label }: GlassDividerProps) {
  if (orientation === 'vertical') {
    return <div className={cn('w-px h-full backdrop-blur-xl bg-white/20', className)} />;
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center', className)}>
        <div className="flex-1 h-px backdrop-blur-xl bg-white/20" />
        <span className="px-4 text-sm text-gray-400">{label}</span>
        <div className="flex-1 h-px backdrop-blur-xl bg-white/20" />
      </div>
    );
  }

  return <div className={cn('h-px backdrop-blur-xl bg-white/20', className)} />;
}
