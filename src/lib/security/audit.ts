import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATED'
  | 'PASSWORD_CHANGED'
  | 'PROJECT_CREATED'
  | 'PROJECT_DELETED'
  | 'FILE_UPLOADED'
  | 'FILE_DELETED'
  | 'MEMORY_CREATED'
  | 'MEMORY_DELETED'
  | 'ADMIN_ACTION'
  | 'SECURITY_EVENT';

export interface AuditLog {
  action: AuditAction;
  userId: string;
  targetId?: string;
  status: 'success' | 'failure';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(log: AuditLog): Promise<void> {
  try {
    const supabase = await createClient();
    const headersList = headers();

    await supabase.from('audit_logs').insert({
      action: log.action,
      user_id: log.userId,
      target_id: log.targetId,
      status: log.status,
      details: log.details,
      ip_address: log.ipAddress || headersList.get('x-forwarded-for'),
      user_agent: log.userAgent || headersList.get('user-agent'),
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

export async function getAuditLogs(userId: string, limit: number = 50): Promise<any[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return data || [];
}
