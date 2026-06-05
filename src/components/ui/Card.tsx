import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className, title }: CardProps) {
  return (
    <div className={cn('bg-surface rounded-lg border border-border overflow-hidden', className)}>
      {title && (
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
