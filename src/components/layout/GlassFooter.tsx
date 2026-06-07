'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassFooterProps {
  children: ReactNode;
  className?: string;
}

export function GlassFooter({ children, className }: GlassFooterProps) {
  return (
    <footer
      className={cn(
        'w-full backdrop-blur-xl bg-black/20 border-t border-white/10 py-4',
        className
      )}
    >
      <div className="container mx-auto px-4">
        {children}
      </div>
    </footer>
  );
}
