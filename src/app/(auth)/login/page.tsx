'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleLogin} className="bg-surface p-8 rounded-lg border border-border w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h1>
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
          {loading ? 'جاري التسجيل...' : 'دخول'}
        </button>
      </form>
    </div>
  );
}
