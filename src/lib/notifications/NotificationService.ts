import { createClient } from '@/lib/supabase/client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private supabase = createClient();

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>): Promise<void> {
    const { data: notification, error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        type: 'info',
        data
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save notification:', error);
      return;
    }

    await this.supabase.channel(`user:${userId}`).send({
      type: 'broadcast',
      event: 'notification',
      payload: notification
    });

    if (this.isBrowser()) {
      this.sendBrowserNotification(title, body);
    }
  }

  private sendBrowserNotification(title: string, body: string): void {
    if (!this.isBrowser()) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return data || [];
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    return count || 0;
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!this.isBrowser()) return false;
    
    if (!('Notification' in window)) {
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

export const notificationService = new NotificationService();
