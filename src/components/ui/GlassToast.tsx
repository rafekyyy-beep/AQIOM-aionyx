'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-green-500/50 bg-green-500/10 text-green-400',
  error: 'border-red-500/50 bg-red-500/10 text-red-400',
  info: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
};

export function GlassToast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
      <div className={cn('backdrop-blur-xl border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3', colors[type])}>
        <Icon className="w-5 h-5" />
        <p className="text-sm">{message}</p>
        <button onClick={() => setIsVisible(false)} className="ml-2 opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

let toastQueue: Array<{ message: string; type: ToastType }> = [];
let toastRoot: HTMLDivElement | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  if (!toastRoot) {
    toastRoot = document.createElement('div');
    toastRoot.id = 'toast-root';
    document.body.appendChild(toastRoot);
  }
  // Simplified - in production, use a proper toast system
  console.log(`[${type}] ${message}`);
}
