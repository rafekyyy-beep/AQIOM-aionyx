'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-red-500">حدث خطأ</h1>
        <p className="text-gray-400">{error.message || 'خطأ غير متوقع'}</p>
        <Button onClick={reset}>إعادة المحاولة</Button>
      </div>
    </div>
  );
}
