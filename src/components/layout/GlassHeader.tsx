'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassHeaderProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function GlassHeader({ children, className, sticky = true }: GlassHeaderProps) {
  return (
    <header
      className={cn(
        'top-0 z-30 w-full backdrop-blur-xl bg-black/20 border-b border-white/10',
        sticky && 'sticky',
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">
        {children}
      </div>
    </header>
  );
}
