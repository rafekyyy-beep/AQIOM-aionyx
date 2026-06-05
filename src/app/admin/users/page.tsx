'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { createClient } from '@/lib/supabase/client';
import { Search, User, Crown, Ban, Shield, MoreVertical, Mail, Calendar, Activity } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  plan: string;
  subscription_status: 'free' | 'pro' | 'enterprise';
  subscription_expires_at: string | null;
  is_active: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  total_messages: number;
  total_conversations: number;
  last_seen: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    setUsers(data || []);
    setFilteredUsers(data || []);
    setLoading(false);
  };

  const updateUserSubscription = async (userId: string, status: string) => {
    const expiresAt = status === 'pro' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
    
    await supabase
      .from('users')
      .update({ 
        subscription_status: status,
        subscription_expires_at: expiresAt,
        plan: status === 'free' ? 'free' : 'pro'
      })
      .eq('id', userId);
    
    fetchUsers();
    setIsUserModalOpen(false);
  };

  const toggleUserBan = async (userId: string, isBanned: boolean, reason?: string) => {
    await supabase
      .from('users')
      .update({ 
        is_banned: !isBanned,
        is_active: isBanned,
        ban_reason: !isBanned ? reason : null
      })
      .eq('id', userId);
    
    fetchUsers();
    setIsBanModalOpen(false);
    setBanReason('');
  };

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case 'enterprise':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">Enterprise</span>;
      case 'pro':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Pro</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">Free</span>;
    }
  };

  const getStatusBadge = (isActive: boolean, isBanned: boolean) => {
    if (isBanned) return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">محظور</span>;
    if (isActive) return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">نشط</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">غير نشط</span>;
  };

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 p-2 bg-surface rounded-lg border border-border w-64"
            />
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">مستخدمي Pro</p>
                <p className="text-2xl font-bold">{users.filter(u => u.subscription_status === 'pro').length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Ban className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">مستخدمين محظورين</p>
                <p className="text-2xl font-bold">{users.filter(u => u.is_banned).length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">نشط اليوم</p>
                <p className="text-2xl font-bold">{users.filter(u => u.last_seen && new Date(u.last_seen).toDateString() === new Date().toDateString()).length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* جدول المستخدمين */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-right text-gray-400">
                  <th className="p-3 text-right">المستخدم</th>
                  <th className="p-3 text-right">البريد الإلكتروني</th>
                  <th className="p-3 text-right">الاشتراك</th>
                  <th className="p-3 text-right">الرسائل</th>
                  <th className="p-3 text-right">الحالة</th>
                  <th className="p-3 text-right">آخر ظهور</th>
                  <th className="p-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-medium">{user.full_name || user.username || 'مستخدم'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-400">{user.email}</td>
                    <td className="p-3">{getSubscriptionBadge(user.subscription_status)}</td>
                    <td className="p-3 text-gray-400">{user.total_messages || 0}</td>
                    <td className="p-3">{getStatusBadge(user.is_active, user.is_banned)}</td>
                    <td className="p-3 text-gray-400 text-sm">
                      {user.last_seen ? new Date(user.last_seen).toLocaleDateString('ar') : '—'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsUserModalOpen(true);
                        }}
                        className="p-1 hover:bg-border rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* مودال تفاصيل المستخدم */}
        <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={`تفاصيل المستخدم`}>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.full_name || selectedUser.username || 'مستخدم'}</h3>
                  <p className="text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">تاريخ التسجيل</p>
                  <p className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString('ar')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">آخر ظهور</p>
                  <p className="text-sm">{selectedUser.last_seen ? new Date(selectedUser.last_seen).toLocaleDateString('ar') : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">إجمالي المحادثات</p>
                  <p className="text-sm">{selectedUser.total_conversations || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">إجمالي الرسائل</p>
                  <p className="text-sm">{selectedUser.total_messages || 0}</p>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <p className="text-xs text-gray-500">السيرة الذاتية</p>
                  <p className="text-sm">{selectedUser.bio}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <select
                  value={selectedSubscription}
                  onChange={(e) => setSelectedSubscription(e.target.value)}
                  className="flex-1 p-2 bg-background rounded-lg border border-border"
                >
                  <option value="">تغيير الخطة</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <Button onClick={() => selectedSubscription && updateUserSubscription(selectedUser.id, selectedSubscription)}>
                  تحديث
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant={selectedUser.is_banned ? 'primary' : 'secondary'}
                  onClick={() => {
                    if (!selectedUser.is_banned) {
                      setIsBanModalOpen(true);
                    } else {
                      toggleUserBan(selectedUser.id, selectedUser.is_banned);
                    }
                  }}
                >
                  {selectedUser.is_banned ? 'إلغاء الحظر' : 'حظر المستخدم'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* مودال سبب الحظر */}
        <Modal isOpen={isBanModalOpen} onClose={() => setIsBanModalOpen(false)} title="سبب الحظر">
          <div className="space-y-4">
            <textarea
              placeholder="اكتب سبب الحظر..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full p-3 bg-background rounded-lg border border-border resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <Button onClick={() => selectedUser && toggleUserBan(selectedUser.id, selectedUser.is_banned, banReason)}>
                تأكيد الحظر
              </Button>
              <Button variant="ghost" onClick={() => setIsBanModalOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
  }
