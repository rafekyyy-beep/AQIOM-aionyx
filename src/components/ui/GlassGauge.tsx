'use client';

import { cn } from '@/lib/utils/cn';

interface GlassGaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-32 h-32',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
};

export function GlassGauge({ value, min = 0, max = 100, label, unit = '%', size = 'md' }: GlassGaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = -180 + (percentage / 100) * 180;

  return (
    <div className={cn('relative', sizes[size])}>
      <svg className="w-full h-full" viewBox="0 0 200 120">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d={`M 20 100 A 80 80 0 0 1 ${100 + 80 * Math.cos(angle * Math.PI / 180)} ${100 - 80 * Math.sin(angle * Math.PI / 180)}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="10" fill="#3b82f6" />
        <line
          x1="100"
          y1="100"
          x2={100 + 50 * Math.cos(angle * Math.PI / 180)}
          y2={100 - 50 * Math.sin(angle * Math.PI / 180)}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <text x="100" y="85" textAnchor="middle" className="text-2xl font-bold fill-white">
          {Math.round(value)}
        </text>
        <text x="100" y="100" textAnchor="middle" className="text-xs fill-gray-400">
          {unit}
        </text>
      </svg>
      {label && <div className="text-center text-sm text-gray-400 mt-2">{label}</div>}
    </div>
  );
}
