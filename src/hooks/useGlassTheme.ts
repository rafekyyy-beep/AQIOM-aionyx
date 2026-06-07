'use client';

import { useEffect, useState } from 'react';

type GlassVariant = 'default' | 'dark' | 'light';

export function useGlassTheme() {
  const [variant, setVariant] = useState<GlassVariant>('default');
  const [blurIntensity, setBlurIntensity] = useState(12);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--glass-blur', `${blurIntensity}px`);
  }, [blurIntensity]);

  const getGlassClass = (baseClass: string = '') => {
    const variants = {
      default: 'backdrop-blur-xl bg-white/10 border-white/20',
      dark: 'backdrop-blur-2xl bg-black/40 border-white/10',
      light: 'backdrop-blur-lg bg-white/5 border-white/15',
    };
    return `${variants[variant]} ${baseClass}`;
  };

  return {
    variant,
    setVariant,
    blurIntensity,
    setBlurIntensity,
    getGlassClass,
  };
}
