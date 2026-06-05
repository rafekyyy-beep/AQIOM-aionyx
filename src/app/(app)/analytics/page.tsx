'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, Users, Clock, TrendingUp, Calendar, Activity } from 'lucide-react';

interface Analytics {
  totalConversations: number;
  totalMessages: number;
  activeDays: number;
  averageMessagesPerDay: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // جلب عدد المحادثات
    const { count: convCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    // جلب عدد الرسائل
    const { count: msgCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    // جلب الأيام النشطة (مثال مبسط)
    const { data: messages } = await supabase
      .from('messages')
      .select('created_at')
      .order('created_at', { ascending: true });

    const uniqueDays = new Set();
    messages?.forEach(msg => {
      const date = new Date(msg.created_at).toDateString();
      uniqueDays.add(date);
    });

    const daysActive = uniqueDays.size;
    const messagesPerDay = messages?.length ? (messages.length / (daysActive || 1)).toFixed(1) : 0;

    setAnalytics({
      totalConversations: convCount || 0,
      totalMessages: msgCount || 0,
      activeDays: daysActive,
      averageMessagesPerDay: parseFloat(messagesPerDay as string),
    });
    setLoading(false);
  };

  const stats = [
    { id: 'conversations', title: 'إجمالي المحادثات', value: analytics?.totalConversations || 0, icon: MessageSquare, color: 'bg-blue-500' },
    { id: 'messages', title: 'إجمالي الرسائل', value: analytics?.totalMessages || 0, icon: Activity, color: 'bg-green-500' },
    { id: 'days', title: 'الأيام النشطة', value: analytics?.activeDays || 0, icon: Calendar, color: 'bg-purple-500' },
    { id: 'avg', title: 'متوسط الرسائل/يوم', value: analytics?.averageMessagesPerDay || 0, icon: TrendingUp, color: 'bg-yellow-500' },
  ];

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">الإحصائيات والتحليلات</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : (
          <>
            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
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

            {/* رسم بياني بسيط للنشاط */}
            <Card title="نشاط المحادثات">
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>رسم بياني تفاعلي قريباً</p>
                  <p className="text-sm mt-2">عدد المحادثات: {analytics?.totalConversations}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
