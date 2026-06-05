'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Calendar, Crown, MessageSquare, TrendingUp, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, setProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ messages: 0, conversations: 0, activeDays: 0 });
  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
    }
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    const { count: msgCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    const { count: convCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    setStats({
      messages: msgCount || 0,
      conversations: convCount || 0,
      activeDays: Math.floor(Math.random() * 30) + 1, // مؤقت
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        username,
        bio,
        location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user?.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      setIsEditing(false);
    }
    setLoading(false);
  };

  const statsCards = [
    { label: 'إجمالي المحادثات', value: stats.conversations, icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'إجمالي الرسائل', value: stats.messages, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'الأيام النشطة', value: stats.activeDays, icon: Calendar, color: 'bg-purple-500' },
  ];

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        {/* بطاقة الملف الشخصي */}
        <Card className="mb-6">
          <div className="relative">
            {/* غلاف */}
            <div className="h-32 bg-gradient-to-r from-primary-600 to-purple-600 rounded-t-lg" />
            
            {/* صورة الملف الشخصي */}
            <div className="absolute -bottom-12 right-6">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-surface flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
            </div>

            {/* زر التعديل */}
            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="w-4 h-4 ml-1" /> : <Edit2 className="w-4 h-4 ml-1" />}
                {isEditing ? 'إلغاء' : 'تعديل'}
              </Button>
            </div>
          </div>

          <div className="pt-16 p-6">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="الاسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  label="اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">السيرة الذاتية</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 bg-background rounded-lg border border-border"
                    rows={3}
                  />
                </div>
                <Input
                  label="الموقع"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold">{fullName || username || 'مستخدم'}</h2>
                <p className="text-gray-400 mt-1">{user?.email}</p>
                {bio && <p className="mt-3 text-gray-300">{bio}</p>}
                {location && (
                  <p className="mt-2 text-sm text-gray-500">📍 {location}</p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">
                    {profile?.subscription_status === 'pro' ? 'Pro' : 
                     profile?.subscription_status === 'enterprise' ? 'Enterprise' : 'Free'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* إحصائيات */}
        <h2 className="text-xl font-semibold mb-4">الإحصائيات</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-20`}>
                    <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* معلومات الحساب */}
        <Card className="mt-6">
          <h3 className="font-semibold mb-3">معلومات الحساب</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">البريد الإلكتروني</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">تاريخ الانضمام</span>
              <span>{new Date(user?.created_at || '').toLocaleDateString('ar')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">آخر تحديث</span>
              <span>{new Date(profile?.updated_at || '').toLocaleDateString('ar')}</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
                  }
