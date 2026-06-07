'use client';

import { ReactNode } from 'react';
import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';

interface GlassAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const variants = {
  danger: 'bg-red-600/30 border-red-500/30 hover:bg-red-600/50',
  warning: 'bg-yellow-600/30 border-yellow-500/30 hover:bg-yellow-600/50',
  info: 'bg-primary-600/30 border-primary-500/30 hover:bg-primary-600/50',
};

export function GlassAlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
}: GlassAlertDialogProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-300 mb-6">{description}</p>
      <div className="flex gap-3 justify-end">
        <GlassButton variant="ghost" onClick={onClose}>
          {cancelText}
        </GlassButton>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={cn('px-4 py-2 rounded-xl border text-white transition-all', variants[variant])}
        >
          {confirmText}
        </button>
      </div>
    </GlassModal>
  );
}
