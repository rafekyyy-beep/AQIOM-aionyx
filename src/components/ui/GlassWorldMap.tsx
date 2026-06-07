'use client';

import { cn } from '@/lib/utils/cn';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  value?: number;
}

interface GlassWorldMapProps {
  locations?: Location[];
  className?: string;
}

export function GlassWorldMap({ locations = [], className }: GlassWorldMapProps) {
  return (
    <div className={cn('relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/20', className)}>
      {/* SVG World Map Placeholder */}
      <svg viewBox="0 0 1000 500" className="w-full h-auto opacity-50">
        <rect x="0" y="0" width="1000" height="500" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="200" cy="250" r="3" fill="#3b82f6" />
        <circle cx="500" cy="200" r="3" fill="#3b82f6" />
        <circle cx="700" cy="300" r="3" fill="#3b82f6" />
        <circle cx="800" cy="150" r="3" fill="#3b82f6" />
        <circle cx="300" cy="350" r="3" fill="#3b82f6" />
      </svg>
      
      {locations.map(location => (
        <div
          key={location.id}
          className="absolute w-2 h-2 bg-primary-500 rounded-full animate-pulse"
          style={{
            left: `${(location.lng + 180) / 360 * 100}%`,
            top: `${(90 - location.lat) / 180 * 100}%`,
          }}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-xs whitespace-nowrap backdrop-blur-xl bg-black/60 rounded text-white">
            {location.name}
          </div>
        </div>
      ))}
    </div>
  );
}
