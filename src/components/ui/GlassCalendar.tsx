'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GlassCalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function GlassCalendar({ value = new Date(), onChange, minDate, maxDate }: GlassCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(value);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return value.toDateString() === date.toDateString();
  };

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDisabled(newDate)) {
      onChange?.(newDate);
    }
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);

  const weekDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-1 rounded-lg hover:bg-white/10">
          <ChevronRight className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-white">
          {currentMonth.toLocaleDateString('ar', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => changeMonth(1)} className="p-1 rounded-lg hover:bg-white/10">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-gray-400 py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map(blank => (
          <div key={`blank-${blank}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const disabled = isDisabled(date);
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={cn(
                'aspect-square rounded-lg text-sm transition-all duration-200',
                isSelected(date) && 'bg-primary-600/40 border border-primary-500/30 text-white',
                isToday(date) && !isSelected(date) && 'bg-white/10 border border-white/20',
                !isSelected(date) && !isToday(date) && 'hover:bg-white/10',
                disabled && 'opacity-30 cursor-not-allowed'
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
            }
