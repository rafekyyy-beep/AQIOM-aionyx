'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassQRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  className?: string;
}

export function GlassQRCode({ value, size = 200, bgColor = 'rgba(255,255,255,0.1)', fgColor = '#3b82f6', className }: GlassQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Simplified QR generation - in production use qrcode library
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;
    
    // Draw glass background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Draw placeholder QR pattern
    ctx.fillStyle = fgColor;
    const blockSize = size / 8;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * blockSize, j * blockSize, blockSize - 2, blockSize - 2);
        }
      }
    }
    
    // Draw center logo area
    ctx.fillStyle = bgColor;
    ctx.fillRect(size * 0.4, size * 0.4, size * 0.2, size * 0.2);
  }, [value, size, bgColor, fgColor]);

  return (
    <div className={cn('backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-2', className)}>
      <canvas ref={canvasRef} width={size} height={size} className="rounded-xl" />
    </div>
  );
}
