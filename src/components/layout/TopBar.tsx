'use client';

import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { Menu, LogOut, User, Moon, Sun } from 'lucide-react';

export function TopBar() {
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore();
  const { user, clearUser } = useUserStore();

  const handleLogout = async () => {
    clearUser();
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:right-80 h-14 bg-surface/80 backdrop-blur-md border-b border-border z-30">
      <div className="flex items-center justify-between h-full px-4">
        {/* زر القائمة للشاشات الصغيرة */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-border rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* الشعار */}
        <div className="flex-1 lg:flex-none">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
            AQIOM
          </h1>
        </div>

        {/* قائمة المستخدم */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 p-2 hover:bg-border rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline text-sm">{user?.email?.split('@')[0]}</span>
            </button>
          }
          align="right"
        >
          <DropdownItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4 inline ml-2" /> : <Moon className="w-4 h-4 inline ml-2" />}
            {theme === 'dark' ? 'فاتح' : 'داكن'}
          </DropdownItem>
          <DropdownItem onClick={handleLogout}>
            <LogOut className="w-4 h-4 inline ml-2" />
            تسجيل خروج
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
