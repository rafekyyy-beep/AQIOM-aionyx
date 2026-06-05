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

  async deleteMemory(memoryId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId);

    if (error) throw error;
  }
}
