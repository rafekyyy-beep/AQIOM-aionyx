'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  icon?: ReactNode;
}

interface GlassTimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
}

export function GlassTimeline({ items, orientation = 'vertical' }: GlassTimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="flex overflow-x-auto pb-8 space-x-6">
        {items.map((item, index) => (
          <div key={item.id} className="flex-1 min-w-[250px] relative">
            <div className="text-center mb-3">
              <div className="w-10 h-10 mx-auto rounded-full backdrop-blur-xl bg-primary-600/30 border border-primary-500/30 flex items-center justify-center">
                {item.icon || index + 1}
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-xs text-primary-400 mb-1">{item.date}</div>
              <h4 className="font-semibold text-white mb-2">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-white/20" />
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-full backdrop-blur-xl bg-primary-600/30 border border-primary-500/30 flex items-center justify-center">
              {item.icon || index + 1}
            </div>
          </div>
          <div className="flex-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-white">{item.title}</h4>
              <span className="text-xs text-primary-400">{item.date}</span>
            </div>
            <p className="text-sm text-gray-400">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
