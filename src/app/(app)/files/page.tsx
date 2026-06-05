'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FileUploader } from '@/components/files/FileUploader';
import { FileList } from '@/components/files/FileList';
import { Tabs } from '@/components/ui/Tabs';

export default function FilesPage() {
  const [refresh, setRefresh] = useState(0);

  const handleUpload = async (file: File) => {
    // Upload logic here
    console.log('Uploading:', file);
    setRefresh(Date.now());
  };

  const tabs = [
    { id: 'all', label: 'جميع الملفات', content: <FileList files={[]} /> },
    { id: 'upload', label: 'رفع ملف', content: <FileUploader onUpload={handleUpload} /> },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">الملفات</h1>
        <Tabs tabs={tabs} defaultTab="all" />
      </div>
    </AppShell>
  );
}
