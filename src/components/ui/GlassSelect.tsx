'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Option {
  value: string;
  label: string;
}

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
}

export function GlassSelect({ value, onChange, options, placeholder, label }: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={selectRef}>
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-right text-white flex items-center justify-between transition-all duration-300 hover:bg-white/10 focus:outline-none focus:border-primary-500/50"
        >
          <span>{selectedOption?.label || placeholder || 'اختر...'}</span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl bg-black/60 border border-white/20 rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                {option.label}
                {value === option.value && <Check className="w-4 h-4 text-primary-500" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
            }
