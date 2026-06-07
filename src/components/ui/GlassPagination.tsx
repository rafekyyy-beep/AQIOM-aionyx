'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { GlassButton } from './GlassButton';

interface GlassPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingsCount?: number;
}

export function GlassPagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingsCount = 1,
}: GlassPaginationProps) {
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const getPageNumbers = () => {
    const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      return [...range(1, rightSiblingIndex), '...', totalPages];
    }
    if (showLeftDots && !showRightDots) {
      return [1, '...', ...range(leftSiblingIndex, totalPages)];
    }
    if (showLeftDots && showRightDots) {
      return [1, '...', ...range(leftSiblingIndex, rightSiblingIndex), '...', totalPages];
    }
    return range(1, totalPages);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <GlassButton
        size="sm"
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronRight className="w-4 h-4" />
      </GlassButton>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={cn(
            'min-w-[36px] h-9 rounded-lg backdrop-blur-xl transition-all duration-300',
            currentPage === page
              ? 'bg-primary-600/40 border border-primary-500/30 text-white'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/15'
          )}
          disabled={typeof page !== 'number'}
        >
          {page}
        </button>
      ))}

      <GlassButton
        size="sm"
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronLeft className="w-4 h-4" />
      </GlassButton>
    </div>
  );
}
