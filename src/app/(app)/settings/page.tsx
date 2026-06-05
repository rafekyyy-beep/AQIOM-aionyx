'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { theme, setTheme, isIslamicMode, toggleIslamicMode } = useUIStore();
  const { user } = useUserStore();

  return (
    <AppShell>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>
        
        <div className="space-y-6">
          {/* المظهر */}
          <div className="bg-surface p-4 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-3">المظهر</h2>
            <div className="flex gap-3">
              <Button
                variant={theme === 'dark' ? 'primary' : 'secondary'}
                onClick={() => setTheme('dark')}
              >
                داكن
              </Button>
              <Button
                variant={theme === 'light' ? 'primary' : 'secondary'}
                onClick={() => setTheme('light')}
              >
                فاتح
              </Button>
            </div>
          </div>

          {/* الوضع الإسلامي */}
          <div className="bg-surface p-4 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-3">الوضع الإسلامي</h2>
            <Button
              variant={isIslamicMode ? 'primary' : 'secondary'}
              onClick={toggleIslamicMode}
            >
              {isIslamicMode ? 'مفعل' : 'غير مفعل'}
            </Button>
          </div>

          {/* معلومات المستخدم */}
          <div className="bg-surface p-4 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-3">الحساب</h2>
            <p className="text-gray-400">البريد: {user?.email}</p>
            <p className="text-gray-400">الخطة: Free</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
