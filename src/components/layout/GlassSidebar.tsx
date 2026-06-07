'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassSidebarProps {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  position?: 'left' | 'right';
}

export function GlassSidebar({ children, isOpen = true, onClose, position = 'left' }: GlassSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 w-80 z-50 transition-transform duration-300',
          'backdrop-blur-2xl bg-black/30 border-r border-white/10',
          position === 'left' ? 'left-0' : 'right-0',
          isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full overflow-auto">
          {children}
        </div>
      </aside>
    </>
  );
}
