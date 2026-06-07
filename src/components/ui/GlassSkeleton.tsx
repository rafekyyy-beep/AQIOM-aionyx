'use client';

import { cn } from '@/lib/utils/cn';

interface GlassSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  animated?: boolean;
}

export function GlassSkeleton({
  variant = 'text',
  width,
  height,
  className,
  animated = true,
}: GlassSkeletonProps) {
  const variants = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'backdrop-blur-sm bg-white/10',
        animated && 'animate-pulse',
        variants[variant],
        className
      )}
      style={{ width, height: height || (variant === 'text' ? '1rem' : undefined) }}
    />
  );
}

export function GlassChatSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <GlassSkeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <GlassSkeleton width="30%" height={16} />
          <GlassSkeleton width="80%" height={14} />
          <GlassSkeleton width="60%" height={14} />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <div className="flex-1 space-y-2 items-end">
          <GlassSkeleton width="40%" height={16} className="ml-auto" />
          <GlassSkeleton width="70%" height={14} className="ml-auto" />
        </div>
        <GlassSkeleton variant="circular" width={40} height={40} />
      </div>
    </div>
  );
}
