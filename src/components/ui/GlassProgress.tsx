'use client';

import { cn } from '@/lib/utils/cn';

interface GlassProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const sizes = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
const variants = {
  default: 'bg-primary-600/70',
  success: 'bg-green-500/70',
  warning: 'bg-yellow-500/70',
  error: 'bg-red-500/70',
};

export function GlassProgress({
  value,
  max = 100,
  size = 'md',
  showLabel,
  className,
  variant = 'default',
}: GlassProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'w-full backdrop-blur-xl bg-white/10 rounded-full overflow-hidden',
          sizes[size],
          className
        )}
      >
        <div
          className={cn('rounded-full transition-all duration-500', variants[variant])}
          style={{ width: `${percentage}%`, height: '100%' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{Math.round(percentage)}%</span>
          <span className="text-gray-400">
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
}
