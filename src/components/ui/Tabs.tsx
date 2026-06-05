'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/helpers';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors rounded-t-lg',
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-border'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">{tabs.find((t) => t.id === activeTab)?.content}</div>
    </div>
  );
}
