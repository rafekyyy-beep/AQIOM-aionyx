'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'left' | 'right' | 'bottom';
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const positions = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
  bottom: 'bottom-0 left-0 right-0',
};

const sizes = {
  left: { sm: 'w-64', md: 'w-80', lg: 'w-96', xl: 'w-[32rem]' },
  right: { sm: 'w-64', md: 'w-80', lg: 'w-96', xl: 'w-[32rem]' },
  bottom: { sm: 'h-64', md: 'h-80', lg: 'h-96', xl: 'h-[32rem]' },
};

export function GlassDrawer({ isOpen, onClose, children, position = 'right', title, size = 'md' }: GlassDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div
        className={cn(
          'fixed z-50 backdrop-blur-2xl bg-black/40 border border-white/20 shadow-2xl transition-transform duration-300',
          positions[position],
          sizes[position][size],
          position === 'left' && (isOpen ? 'translate-x-0' : '-translate-x-full'),
          position === 'right' && (isOpen ? 'translate-x-0' : 'translate-x-full'),
          position === 'bottom' && (isOpen ? 'translate-y-0' : 'translate-y-full')
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}
        <div className="p-4 overflow-auto h-full">{children}</div>
      </div>
    </>
  );
}
