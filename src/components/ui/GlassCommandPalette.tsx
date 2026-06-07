'use client';

import { useEffect, useState } from 'react';
import { Search, Command } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

interface GlassCommandPaletteProps {
  items: CommandItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function GlassCommandPalette({ items, isOpen, onClose }: GlassCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'ArrowDown') {
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      }
      if (e.key === 'ArrowUp') {
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="backdrop-blur-2xl bg-black/60 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="اكتب أمراً..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-white/10 rounded-md text-gray-400">
              <Command className="w-3 h-3 inline" /> K
            </kbd>
          </div>
          <div className="max-h-96 overflow-auto">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-400">لا توجد نتائج</div>
            ) : (
              filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-right transition-colors',
                    index === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-white">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <kbd className="px-2 py-1 text-xs bg-white/10 rounded-md text-gray-400">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
