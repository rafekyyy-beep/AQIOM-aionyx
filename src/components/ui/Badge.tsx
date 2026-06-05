import { cn } from '@/lib/helpers';

const variants = {
  default: 'bg-gray-500/20 text-gray-400',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  error: 'bg-red-500/20 text-red-400',
  info: 'bg-blue-500/20 text-blue-400',
};

const sizes = { sm: 'px-1.5 py-0.5 text-xs', md: 'px-2 py-1 text-sm', lg: 'px-3 py-1.5 text-base' };

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return <span className={cn('rounded-full font-medium', variants[variant], sizes[size], className)}>{children}</span>;
}
