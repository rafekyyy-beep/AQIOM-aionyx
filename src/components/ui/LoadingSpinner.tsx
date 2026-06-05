import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          sizes[size],
          'border-primary-600 border-t-transparent rounded-full animate-spin'
        )}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div className="space-y-3">
      <div className="h-4 bg-border rounded-full animate-pulse w-3/4" />
      <div className="h-4 bg-border rounded-full animate-pulse w-1/2" />
      <div className="h-4 bg-border rounded-full animate-pulse w-5/6" />
      <div className="h-32 bg-border rounded-lg animate-pulse" />
    </div>
  );
}
