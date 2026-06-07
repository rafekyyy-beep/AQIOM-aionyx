'use client';

import { cn } from '@/lib/utils/cn';

interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

interface GlassHeatmapProps {
  data: HeatmapData[];
  xLabels: string[];
  yLabels: string[];
  className?: string;
}

export function GlassHeatmap({ data, xLabels, yLabels, className }: GlassHeatmapProps) {
  const getColor = (value: number) => {
    if (value < 20) return 'bg-blue-500/20';
    if (value < 40) return 'bg-blue-500/40';
    if (value < 60) return 'bg-primary-500/40';
    if (value < 80) return 'bg-orange-500/40';
    return 'bg-red-500/60';
  };

  const getValue = (x: string, y: string) => {
    const item = data.find(d => d.x === x && d.y === y);
    return item?.value || 0;
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="inline-block min-w-full">
        <div className="grid" style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, 1fr)` }}>
          <div className="p-2" />
          {xLabels.map(label => (
            <div key={label} className="p-2 text-center text-xs text-gray-400">{label}</div>
          ))}
          {yLabels.map(yLabel => (
            <>
              <div className="p-2 text-right text-xs text-gray-400">{yLabel}</div>
              {xLabels.map(xLabel => {
                const value = getValue(xLabel, yLabel);
                return (
                  <div
                    key={`${xLabel}-${yLabel}`}
                    className={cn('p-2 text-center text-xs text-white rounded-lg m-1', getColor(value))}
                  >
                    {value}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
