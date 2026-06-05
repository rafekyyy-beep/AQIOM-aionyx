/**
 * AQIOM Error Handler - نظام إدارة الأخطاء
 * 
 * الميزات:
 * - تصنيف الأخطاء حسب النوع
 * - تسجيل الأخطاء في قاعدة البيانات
 * - إشعارات الأخطاء الحرجة
 * - تقارير الأخطاء
 */

import { createClient } from '@/lib/supabase/server';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'database' | 'api' | 'auth' | 'validation' | 'external' | 'system';

export interface AppError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  stack?: string;
  userId?: string;
  path?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class ErrorHandler {
  private errors: AppError[] = [];
  
  async logError(error: AppError): Promise<void> {
    this.errors.push(error);
    
    // تسجيل في قاعدة البيانات
    const supabase = await createClient();
    await supabase.from('error_logs').insert({
      error_id: error.id,
      message: error.message,
      category: error.category,
      severity: error.severity,
      stack: error.stack,
      user_id: error.userId,
      path: error.path,
      metadata: error.metadata
    });
    
    // إشعار للأخطاء الحرجة
    if (error.severity === 'critical') {
      await this.notifyCriticalError(error);
    }
    
    // الاحتفاظ بآخر 1000 خطأ فقط
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }
  }
  
  private async notifyCriticalError(error: AppError): Promise<void> {
    // إرسال إشعار إلى فريق التطوير
    console.error('[CRITICAL ERROR]', error);
    // يمكن إضافة إرسال بريد إلكتروني أو رسالة إلى Slack
  }
  
  getErrors(category?: ErrorCategory): AppError[] {
    if (category) {
      return this.errors.filter(e => e.category === category);
    }
    return this.errors;
  }
  
  clearErrors(): void {
    this.errors = [];
  }
}

export const errorHandler = new ErrorHandler();
