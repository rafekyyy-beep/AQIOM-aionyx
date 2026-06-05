'use client';

import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sun, Moon } from 'lucide-react';

export function ThemeSettings() {
  const { theme, setTheme } = useUIStore();

  return (
    <Card title="المظهر">
      <div className="flex gap-3">
        <Button
          variant={theme === 'light' ? 'primary' : 'secondary'}
          onClick={() => setTheme('light')}
          className="flex items-center gap-2"
        >
          <Sun className="w-4 h-4" />
          فاتح
        </Button>
        <Button
          variant={theme === 'dark' ? 'primary' : 'secondary'}
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2"
        >
          <Moon className="w-4 h-4" />
          داكن
        </Button>
      </div>
    </Card>
  );
}
