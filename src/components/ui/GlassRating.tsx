'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GlassRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function GlassRating({ value = 0, onChange, max = 5, size = 'md', readonly = false }: GlassRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating === value ? 0 : rating);
    }
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => !readonly && setHoverValue(rating)}
          onMouseLeave={() => !readonly && setHoverValue(0)}
          className={cn('transition-all duration-200', readonly ? 'cursor-default' : 'cursor-pointer')}
        >
          <Star
            className={cn(
              sizes[size],
              (hoverValue ? rating <= hoverValue : rating <= value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-500',
              'transition-all duration-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}
