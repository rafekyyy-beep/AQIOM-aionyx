/**
 * AQIOM Notification Service - نظام الإشعارات المتقدم
 * 
 * الميزات:
 * - إشعارات فورية
 * - إشعارات بريد إلكتروني
 * - إشعارات SMS
 * - إشعارات داخل التطبيق
 */

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
  
  async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>): Promise<void> {
    // حفظ الإشعار في قاعدة البيانات
    const { data: notification } = await this.supabase
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
    
    // إرسال إشعار فوري عبر WebSocket
    await this.supabase.channel(`user:${userId}`).send({
      type: 'broadcast',
      event: 'notification',
      payload: notification
    });
    
    // إرسال إشعار PWA إذا كان متاحاً
    this.sendPWANotification(userId, title, body);
  }
  
  private async sendPWANotification(userId: string, title: string, body: string): Promise<void> {
    // إرسال إشعار عبر Service Worker
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
    if (!('Notification' in window)) {
      console.log('هذا المتصفح لا يدعم الإشعارات');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

export const notificationService = new NotificationService();
