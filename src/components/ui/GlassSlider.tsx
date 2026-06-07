'use client';

import { cn } from '@/lib/utils/cn';

interface GlassSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function GlassSlider({ value, onChange, min = 0, max = 100, step = 1, label }: GlassSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between">
          <span className="text-sm text-gray-300">{label}</span>
          <span className="text-sm text-primary-400">{value}</span>
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10"
          style={{
            background: `linear-gradient(to right, rgb(59,130,246) 0%, rgb(59,130,246) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: rgb(59,130,246);
            border: 2px solid white;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(59,130,246,0.5);
          }
        `}</style>
      </div>
    </div>
  );
}
