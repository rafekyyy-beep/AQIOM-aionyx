'use client';

import { useEffect, useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { GlassToast } from './GlassToast';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

interface GlassKonamiProps {
  onActivate?: () => void;
  secretMessage?: string;
}

export function GlassKonami({ onActivate, secretMessage = '🎉 كود كونامي! أنت محترف!' }: GlassKonamiProps) {
  const [index, setIndex] = useState(0);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activated) return;

      const requiredKey = KONAMI_CODE[index];
      if (e.code === requiredKey) {
        setIndex((prev) => prev + 1);
        if (index + 1 === KONAMI_CODE.length) {
          setActivated(true);
          onActivate?.();
          setIndex(0);
        }
      } else {
        setIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, activated, onActivate]);

  if (!activated) return null;

  return (
    <GlassToast
      message={secretMessage}
      type="success"
      duration={5000}
      onClose={() => setActivated(false)}
    />
  );
}
