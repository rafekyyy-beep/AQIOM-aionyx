'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface GlassAccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  multiple?: boolean;
}

export function GlassAccordion({ items, defaultOpen = [], multiple = false }: GlassAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (multiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        return (
          <div
            key={item.id}
            className="rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-right hover:bg-white/5 transition-colors"
            >
              <span className="font-medium text-white">{item.title}</span>
              <ChevronDown className={cn('w-5 h-5 transition-transform', isOpen && 'rotate-180')} />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                isOpen ? 'max-h-96' : 'max-h-0'
              )}
            >
              <div className="p-4 pt-0 text-gray-300 text-sm border-t border-white/10">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
