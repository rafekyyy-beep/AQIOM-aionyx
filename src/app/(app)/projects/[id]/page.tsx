'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, FileText, CheckSquare, FolderOpen } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chats' | 'files' | 'tasks'>('chats');
  const supabase = createClient();

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    setProject(data);
    setLoading(false);
  };

  const tabs = [
    { id: 'chats', label: 'المحادثات', icon: MessageSquare },
    { id: 'files', label: 'الملفات', icon: FileText },
    { id: 'tasks', label: 'المهام', icon: CheckSquare },
  ] as const;

  if (loading) {
    return (
      <AppShell>
        <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="p-8 text-center text-gray-400">المشروع غير موجود</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.description && (
            <p className="text-gray-400 mt-1">{project.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'chats' && (
            <Card>
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>المحادثات المرتبطة بهذا المشروع</p>
                <Button variant="ghost" className="mt-4">محادثة جديدة</Button>
              </div>
            </Card>
          )}
          {activeTab === 'files' && (
            <Card>
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>الملفات المرتبطة بهذا المشروع</p>
                <Button variant="ghost" className="mt-4">رفع ملف</Button>
              </div>
            </Card>
          )}
          {activeTab === 'tasks' && (
            <Card>
              <div className="text-center py-8 text-gray-400">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>المهام المرتبطة بهذا المشروع</p>
                <Button variant="ghost" className="mt-4">إضافة مهمة</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
          }
