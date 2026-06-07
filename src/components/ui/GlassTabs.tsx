'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface GlassTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function GlassTabs({ tabs, defaultTab, onChange }: GlassTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div>
      <div className="flex gap-1 p-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300',
              activeTab === tab.id
                ? 'bg-primary-600/40 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
