'use client';

import { cn } from '@/lib/helpers';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useState } from 'react';

const icons = { info: Info, success: CheckCircle, warning: AlertCircle, error: XCircle };
const variants = {
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  success: 'bg-green-500/10 border-green-500/20 text-green-400',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
};

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({ type = 'info', title, message, dismissible, onDismiss, className }: AlertProps) {
  const [visible, setVisible] = useState(true);
  const Icon = icons[type];

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className={cn('relative rounded-lg border p-4 flex gap-3', variants[type], className)}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {dismissible && (
        <button onClick={handleDismiss} className="shrink-0 p-1 hover:bg-white/10 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
