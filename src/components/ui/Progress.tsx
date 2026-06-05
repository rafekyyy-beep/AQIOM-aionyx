import { cn } from '@/lib/helpers';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizes = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

export function Progress({ value, max = 100, size = 'md', showLabel, className }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1">
      <div className={cn('w-full bg-gray-800 rounded-full overflow-hidden', sizes[size], className)}>
        <div
          className="bg-primary-600 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, height: '100%' }}
        />
      </div>
      {showLabel && <p className="text-xs text-gray-400">{Math.round(percentage)}%</p>}
    </div>
  );
}
