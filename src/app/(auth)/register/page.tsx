'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('تم إنشاء الحساب بنجاح!');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleRegister} className="bg-surface p-8 rounded-lg border border-border w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">إنشاء حساب</h1>
        <input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 bg-background rounded-lg border border-border"
          required
        />
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-background rounded-lg border border-border"
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 bg-background rounded-lg border border-border"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'جاري الإنشاء...' : 'تسجيل'}
        </button>
      </form>
    </div>
  );
        }
