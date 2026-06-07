'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { GlassCard } from './GlassCard';

interface GlassStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export function GlassStatsCard({
  title,
  value,
  icon,
  change,
  changeLabel,
  className,
}: GlassStatsCardProps) {
  const isPositive = change && change > 0;

  return (
    <GlassCard className={cn('p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10">
          {icon}
        </div>
        <span className="text-xs text-gray-400">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={cn('text-xs', isPositive ? 'text-green-400' : 'text-red-400')}>
                {Math.abs(change)}%
              </span>
              {changeLabel && <span className="text-xs text-gray-500">{changeLabel}</span>}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
