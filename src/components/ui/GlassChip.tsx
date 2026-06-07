'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GlassChipProps {
  label: string;
  icon?: ReactNode;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

const variants = {
  default: 'bg-white/10 border-white/20 text-gray-300',
  primary: 'bg-primary-600/20 border-primary-500/30 text-primary-400',
  success: 'bg-green-500/20 border-green-500/30 text-green-400',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
};

export function GlassChip({ label, icon, onRemove, onClick, className, variant = 'default' }: GlassChipProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm border text-sm transition-colors',
        variants[variant],
        onClick && 'cursor-pointer hover:brightness-110',
        className
      )}
    >
      {icon}
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-70"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
