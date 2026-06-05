'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, Check, X, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { formatRelativeTime } from '@/lib/utils/formatters';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();

    // الاشتراك في التحديثات المباشرة
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.is_read).length || 0);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Dropdown
      trigger={
        <button className="relative p-2 hover:bg-border rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      }
      align="right"
    >
      <div className="w-80 max-h-96 overflow-auto">
        <div className="p-3 border-b border-border flex justify-between items-center sticky top-0 bg-surface">
          <span className="font-semibold">الإشعارات</span>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-primary-500 hover:text-primary-400">
      تحديث الكل
            </button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 border-b border-border hover:bg-border/50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-primary-500/5' : ''}`}
              onClick={() => {
                if (!notif.is_read) markAsRead(notif.id);
                if (notif.action_url) window.location.href = notif.action_url;
              }}
            >
              <div className="flex gap-3">
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                  <p className="text-[10px] text-gray-500 mt-2">{formatRelativeTime(notif.created_at)}</p>
                </div>
                {!notif.is_read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />}
              </div>
            </div>
          ))
        )}
      </div>
    </Dropdown>
  );
}
