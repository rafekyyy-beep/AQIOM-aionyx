'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useUserStore } from '@/store/userStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Memory {
  id: string;
  key: string;
  value: string;
  created_at: string;
}

export default function MemoryPage() {
  const { user } = useUserStore();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  const fetchMemories = async () => {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    setMemories(data || []);
    setLoading(false);
  };

  const addMemory = async () => {
    if (!newKey || !newValue) return;

    await supabase.from('memories').insert({
      user_id: user?.id,
      key: newKey,
      value: newValue,
    });

    setNewKey('');
    setNewValue('');
    fetchMemories();
  };

  const deleteMemory = async (id: string) => {
    await supabase.from('memories').delete().eq('id', id);
    fetchMemories();
  };

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">الذاكرة</h1>

        {/* إضافة ذاكرة جديدة */}
        <Card title="إضافة تذكير جديد" className="mb-6">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="المفتاح (مثل: لوني المفضل)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full p-3 bg-background rounded-lg border border-border"
            />
            <input
              type="text"
              placeholder="القيمة (مثل: الأزرق)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full p-3 bg-background rounded-lg border border-border"
            />
            <Button onClick={addMemory}>إضافة</Button>
          </div>
        </Card>

        {/* قائمة الذكريات */}
        {loading ? (
          <p className="text-gray-400">جاري التحميل...</p>
        ) : memories.length === 0 ? (
          <p className="text-gray-400">لا توجد ذكريات محفوظة</p>
        ) : (
          <div className="space-y-3">
            {memories.map((memory) => (
              <Card key={memory.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{memory.key}</h3>
                    <p className="text-gray-400 text-sm mt-1">{memory.value}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(memory.created_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMemory(memory.id)}
                  >
                    حذف
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
      }
