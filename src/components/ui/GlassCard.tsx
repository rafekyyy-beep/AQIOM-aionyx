'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: 'default' | 'dark' | 'light';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variants = {
  default: 'backdrop-blur-xl bg-white/10 border border-white/15',
  dark: 'backdrop-blur-2xl bg-black/40 border border-white/10',
  light: 'backdrop-blur-lg bg-white/5 border border-white/20',
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  variant = 'default',
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl shadow-lg transition-all duration-300',
        variants[variant],
        paddings[padding],
        hover && 'hover:shadow-xl hover:bg-white/15 hover:scale-[1.01]',
        glow && 'glow',
        className
      )}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('border-b border-white/10 pb-3 mb-4', className)}>
      {children}
    </div>
  );
}

export function GlassCardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex-1', className)}>{children}</div>;
}

export function GlassCardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('border-t border-white/10 pt-3 mt-4', className)}>
      {children}
    </div>
  );
}
