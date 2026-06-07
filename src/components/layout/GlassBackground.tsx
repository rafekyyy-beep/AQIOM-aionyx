'use client';

import { ReactNode } from 'react';

interface GlassBackgroundProps {
  children: ReactNode;
  animated?: boolean;
}

export function GlassBackground({ children, animated = true }: GlassBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* خلفية متدرجة متحركة */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#050508] to-[#000000]" />
      
      {/* كرات زجاجية متحركة */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float delay-1000" />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-float delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-float delay-3000" />
      </div>

      {/* ضبابية زجاجية علوية */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
      
      {/* المحتوى */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}
