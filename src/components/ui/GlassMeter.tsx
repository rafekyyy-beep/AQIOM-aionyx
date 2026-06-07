'use client';

import { cn } from '@/lib/utils/cn';

interface GlassMeterProps {
  value: number;
  max?: number;
  label?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

const variants = {
  primary: 'bg-primary-500/70',
  success: 'bg-green-500/70',
  warning: 'bg-yellow-500/70',
  danger: 'bg-red-500/70',
};

const sizes = {
  sm: 'h-20 w-20',
  md: 'h-28 w-28',
  lg: 'h-36 w-36',
};

export function GlassMeter({ value, max = 100, label, unit = '%', size = 'md', variant = 'primary' }: GlassMeterProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;

  const dimensions = {
    sm: { radius: 30, strokeWidth: 6, viewBox: 32, center: 32 },
    md: { radius: 40, strokeWidth: 8, viewBox: 44, center: 44 },
    lg: { radius: 52, strokeWidth: 10, viewBox: 56, center: 56 },
  };

  const dim = dimensions[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizes[size])}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${dim.viewBox * 2} ${dim.viewBox * 2}`}>
          <circle
            cx={dim.viewBox}
            cy={dim.viewBox}
            r={dim.radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={dim.strokeWidth}
          />
          <circle
            cx={dim.viewBox}
            cy={dim.viewBox}
            r={dim.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={dim.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-500', variants[variant])}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{Math.round(value)}</span>
          <span className="text-xs text-gray-400 ml-0.5">{unit}</span>
        </div>
      </div>
      {label && <span className="text-sm text-gray-400">{label}</span>}
    </div>
  );
}
