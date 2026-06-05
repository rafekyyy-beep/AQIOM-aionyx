'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/Input';
import { Search, MessageSquare, Folder, FileText } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">البحث</h1>
        <Input
          placeholder="ابحث في المحادثات، المشاريع، الملفات..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-6"
          icon={<Search className="w-4 h-4" />}
        />

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">المحادثات</h2>
            <div className="text-gray-500 text-center py-8">لا توجد نتائج</div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">المشاريع</h2>
            <div className="text-gray-500 text-center py-8">لا توجد نتائج</div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">الملفات</h2>
            <div className="text-gray-500 text-center py-8">لا توجد نتائج</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
