import { createClient } from '@/lib/supabase/server';

export interface Memory {
  id: string;
  user_id: string;
  key: string;
  value: string;
  created_at: string;
}

export class MemoryEngine {
  async getMemories(userId: string, limit: number = 10): Promise<Memory[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async saveMemory(userId: string, key: string, value: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('memories')
      .insert({ user_id: userId, key, value });

    if (error) throw error;
  }

  // ✅ إصلاح: إضافة التحقق من userId
  async deleteMemory(memoryId: string, userId: string): Promise<void> {
    const supabase = await createClient();
    
    // ✅ التحقق من أن الذكر تخص المستخدم قبل الحذف
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', userId);  // ← هذا يمنع IDOR

    if (error) throw error;
  }

  // ✅ إضافة دالة لتحديث الذاكرة مع التحقق من الملكية
  async updateMemory(memoryId: string, userId: string, key: string, value: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('memories')
      .update({ key, value })
      .eq('id', memoryId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
