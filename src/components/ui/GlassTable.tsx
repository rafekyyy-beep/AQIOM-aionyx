'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => ReactNode;
  className?: string;
}

interface GlassTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function GlassTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  className,
}: GlassTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-xl backdrop-blur-xl bg-white/5 border border-white/10', className)}>
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {columns.map((column) => (
              <th key={String(column.key)} className={cn('px-4 py-3 text-sm font-medium text-gray-300', column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b border-white/5 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-white/5'
              )}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className={cn('px-4 py-3 text-sm text-gray-200', column.className)}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400">لا توجد بيانات</div>
      )}
    </div>
  );
}
