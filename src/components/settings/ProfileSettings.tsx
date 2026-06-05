'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function ProfileSettings() {
  const { profile, setProfile } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
  });

  const handleSave = async () => {
    setLoading(true);
    // API call to update profile
    setProfile({ ...profile, ...form });
    setLoading(false);
  };

  return (
    <Card title="الملف الشخصي">
      <div className="space-y-4">
        <Input
          label="الاسم الكامل"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <Input
          label="اسم المستخدم"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <textarea
          label="السيرة الذاتية"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700"
          rows={3}
        />
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </Card>
  );
}
